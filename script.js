(() => {
    "use strict";

    // Elements
    const grid = document.getElementById("calendar-grid");
    const labelMonth = document.getElementById("label-month");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const btnToday = document.getElementById("btn-today");
    const btnAdd = document.getElementById("btn-add");
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const cancelModalBtn = document.getElementById("cancel-modal");
    const form = document.getElementById("event-form");
    const fieldId = document.getElementById("event-id");
    const fieldDate = document.getElementById("event-date");
    const fieldTitle = document.getElementById("event-title");
    const fieldStart = document.getElementById("event-start");
    const fieldEnd = document.getElementById("event-end");
    const fieldColor = document.getElementById("event-color");
    const fieldDesc = document.getElementById("event-desc");
    const btnDelete = document.getElementById("delete-event");
    const toastEl = document.getElementById("toast");

    const dayCellTemplate = document.getElementById("day-cell-template");
    const eventChipTemplate = document.getElementById("event-chip-template");

    // State
    let currentMonthAnchor = startOfMonth(new Date());

    // Storage helpers
    const STORAGE_KEY = "calendar_events_v1";
    function loadEvents() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    function saveEvents(events) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
    function upsertEvent(event) {
        const events = loadEvents();
        const idx = events.findIndex(e => e.id === event.id);
        if (idx >= 0) {
            events[idx] = event;
        } else {
            events.push(event);
        }
        saveEvents(events);
    }
    function deleteEventById(id) {
        const events = loadEvents().filter(e => e.id !== id);
        saveEvents(events);
    }

    // Utils
    function uuid() {
        if (crypto && crypto.randomUUID) return crypto.randomUUID();
        return "evt-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    function pad(n) { return n.toString().padStart(2, "0"); }
    function formatYYYYMMDD(date) {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    function parseYYYYMMDD(str) {
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
    function endOfMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }
    function addMonths(date, delta) { return new Date(date.getFullYear(), date.getMonth() + delta, 1); }
    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
    function monthLabel(date) {
        return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }
    function compareTime(a, b) {
        return a.localeCompare(b);
    }

    function clampTimeRange(start, end) {
        if (!start || !end) return { start, end };
        if (compareTime(end, start) <= 0) {
            const [h, m] = start.split(":").map(Number);
            const endDate = new Date();
            endDate.setHours(h + 1, m, 0, 0);
            return { start, end: `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}` };
        }
        return { start, end };
    }

    // Build month matrix (6 weeks = 42 days)
    function buildMonthCells(anchorDate) {
        const start = startOfMonth(anchorDate);
        const end = endOfMonth(anchorDate);
        const startWeekday = start.getDay(); // 0..6 (Sun..Sat)

        // Start from the Sunday before (or same day if Sunday)
        const firstCell = new Date(start);
        firstCell.setDate(start.getDate() - startWeekday);

        const cells = [];
        for (let i = 0; i < 42; i++) {
            const date = new Date(firstCell);
            date.setDate(firstCell.getDate() + i);
            const inCurrentMonth = date.getMonth() === anchorDate.getMonth();
            cells.push({ date, inCurrentMonth });
        }
        return cells;
    }

    // Rendering
    function render() {
        labelMonth.textContent = monthLabel(currentMonthAnchor);
        grid.innerHTML = "";

        const today = new Date();
        const eventsByDay = groupEventsByDay(loadEvents());
        const cells = buildMonthCells(currentMonthAnchor);

        for (const { date, inCurrentMonth } of cells) {
            const node = dayCellTemplate.content.firstElementChild.cloneNode(true);
            const dayNumberEl = node.querySelector(".day-number");
            const eventsContainer = node.querySelector(".events");

            node.dataset.date = formatYYYYMMDD(date);
            if (!inCurrentMonth) node.classList.add("outside");
            if (sameDay(date, today)) node.classList.add("today");
            dayNumberEl.textContent = String(date.getDate());

            node.addEventListener("click", (e) => {
                // If clicking on an event chip, handled separately via delegation
                if (e.target.closest(".event-chip")) return;
                openModalForCreate(formatYYYYMMDD(date));
            });

            // Drag and drop targets
            node.addEventListener("dragover", (e) => { e.preventDefault(); });
            node.addEventListener("drop", (e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (!id) return;
                const newDate = node.dataset.date;
                const events = loadEvents();
                const idx = events.findIndex(ev => ev.id === id);
                if (idx >= 0) {
                    events[idx].date = newDate;
                    saveEvents(events);
                    showToast("Event rescheduled");
                    render();
                }
            });

            const key = formatYYYYMMDD(date);
            const events = (eventsByDay.get(key) || []).slice().sort((a, b) => compareTime(a.start, b.start));
            for (const ev of events) {
                const chip = buildEventChip(ev);
                eventsContainer.appendChild(chip);
            }

            grid.appendChild(node);
        }
    }

    function groupEventsByDay(events) {
        const map = new Map();
        for (const e of events) {
            if (!map.has(e.date)) map.set(e.date, []);
            map.get(e.date).push(e);
        }
        return map;
    }

    function buildEventChip(ev) {
        const chip = eventChipTemplate.content.firstElementChild.cloneNode(true);
        const timeEl = chip.querySelector(".event-time");
        const titleEl = chip.querySelector(".event-title");
        timeEl.textContent = `${ev.start}`;
        titleEl.textContent = ev.title;
        chip.style.borderLeft = `4px solid ${ev.color || "#1a73e8"}`;
        chip.dataset.id = ev.id;
        chip.title = `${ev.title}\n${ev.start} - ${ev.end}`;

        chip.addEventListener("click", (e) => {
            e.stopPropagation();
            openModalForEdit(ev);
        });
        chip.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", ev.id);
        });
        return chip;
    }

    // Modal logic
    function openModalForCreate(dateStr) {
        resetForm();
        modalTitle.textContent = "Add event";
        fieldDate.value = dateStr || formatYYYYMMDD(new Date());
        btnDelete.classList.add("hidden");
        showModal();
    }
    function openModalForEdit(ev) {
        resetForm();
        modalTitle.textContent = "Edit event";
        fieldId.value = ev.id;
        fieldDate.value = ev.date;
        fieldTitle.value = ev.title;
        fieldStart.value = ev.start;
        fieldEnd.value = ev.end;
        fieldColor.value = ev.color || "#1a73e8";
        fieldDesc.value = ev.desc || "";
        btnDelete.classList.remove("hidden");
        showModal();
    }
    function resetForm() {
        form.reset();
        fieldId.value = "";
        fieldColor.value = "#1a73e8";
    }
    function showModal() {
        modal.classList.remove("hidden");
    }
    function hideModal() {
        modal.classList.add("hidden");
    }

    // Event handlers
    btnPrev.addEventListener("click", () => { currentMonthAnchor = addMonths(currentMonthAnchor, -1); render(); });
    btnNext.addEventListener("click", () => { currentMonthAnchor = addMonths(currentMonthAnchor, 1); render(); });
    btnToday.addEventListener("click", () => { currentMonthAnchor = startOfMonth(new Date()); render(); });

    btnAdd.addEventListener("click", () => {
        // If viewing current month, use today; else use first day of currentMonthAnchor
        const today = new Date();
        const useToday = today.getFullYear() === currentMonthAnchor.getFullYear() && today.getMonth() === currentMonthAnchor.getMonth();
        const dateStr = useToday ? formatYYYYMMDD(today) : formatYYYYMMDD(currentMonthAnchor);
        openModalForCreate(dateStr);
    });

    cancelModalBtn.addEventListener("click", hideModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = fieldId.value || uuid();
        const date = fieldDate.value;
        const title = fieldTitle.value.trim();
        const { start, end } = clampTimeRange(fieldStart.value, fieldEnd.value);
        const color = fieldColor.value;
        const desc = fieldDesc.value.trim();

        if (!title) {
            showToast("Title is required");
            return;
        }
        const newEvent = { id, date, title, start, end, color, desc };
        upsertEvent(newEvent);
        showToast(fieldId.value ? "Event updated" : "Event added");
        hideModal();
        render();
    });

    btnDelete.addEventListener("click", () => {
        const id = fieldId.value;
        if (!id) return;
        const ok = confirm("Delete this event?");
        if (!ok) return;
        deleteEventById(id);
        showToast("Event deleted");
        hideModal();
        render();
    });

    // Toast
    let toastTimer = null;
    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.add("show");
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastEl.classList.remove("show"); }, 1800);
    }

    // Initialize
    render();
})();


