import $ from 'jquery';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section-form');

    let dynamicGuideRows = [];
    let originalValuesData = null;
    let originalGuideData = null;

    // Fetch unique guide rows from DB
    async function fetchUniqueGuideRows() {
        try {
            const response = await fetch('/admin/discoverDetails/guide-rows/unique');
            const res = await response.json();
            if (res.success) {
                dynamicGuideRows = res.rows;
            }
        } catch (err) {
            console.error('Error fetching unique guide rows:', err);
        }
    }

    fetchUniqueGuideRows();

    const valuesContainer = document.getElementById('values-container');
    let guideTags = [];

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.section;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `section-${target}`) s.classList.add('active');
            });
        });
    });

    // Handle initial load
    loadData();

    function loadData() {
        // Initialize tags input before loading data so renderGuide can use it
        initializeTagsInput('guideTags', 'guideTagInput', 'guideHiddenInput', guideTags);

        fetch('/admin/discoverDetails/getdetails')
            .then(response => response.json())
            .then(res => {
                if (res.success) {
                    renderValues(res.data.values);
                    renderGuide(res.data.buyer);
                    setupValidation();
                    // Snapshot original data for change detection
                    originalValuesData = JSON.stringify(res.data.values || []);
                    originalGuideData = JSON.stringify({
                        title: res.data.buyer?.heading?.title || '',
                        description: res.data.buyer?.heading?.description || '',
                        rows: (res.data.buyer?.rows || []).map(r => r.row_description || r.text || r)
                    });
                }
            })
            .catch(err => console.error('Error loading data:', err));
    }

    function initializeTagsInput(tagsListId, inputId, hiddenInputId, tagsArray) {
        const tagsList = document.getElementById(tagsListId);
        const input = document.getElementById(inputId);
        const hiddenInput = document.getElementById(hiddenInputId);
        const suggestionsBox = document.getElementById('guideSuggestions');
        const container = input?.closest('.amenities-dropdown-container');

        if (!tagsList || !input || !hiddenInput) return;

        function addTag(text) {
            const trimmed = text.trim();
            if (!trimmed || tagsArray.includes(trimmed)) return;

            tagsArray.push(trimmed);
            renderTags();
            updateHiddenInput();
            input.value = '';
            hideSuggestions();

            // Hide validation message if it exists
            const msg = document.querySelector('#section-buyer-guide .required-container-message');
            if (msg) msg.style.display = 'none';
        }

        function removeTag(index) {
            tagsArray.splice(index, 1);
            renderTags();
            updateHiddenInput();

            // Show validation message if no tags left and message element exists
            if (tagsArray.length === 0) {
                const msg = document.querySelector('#section-buyer-guide .required-container-message');
                if (msg) msg.style.display = 'block';
            }
        }

        function renderTags() {
            tagsList.innerHTML = '';
            tagsArray.forEach((tag, index) => {
                const tagEl = document.createElement('div');
                tagEl.className = 'tag';
                tagEl.innerHTML = `
                    <span class="tag-text">${tag}</span>
                    <button type="button" class="tag-remove" data-index="${index}">×</button>
                `;
                tagsList.appendChild(tagEl);
            });
        }

        function updateHiddenInput() {
            hiddenInput.value = JSON.stringify(tagsArray);
        }

        function showSuggestions(filtered) {
            if (!suggestionsBox) return;
            if (filtered.length === 0) {
                hideSuggestions();
                return;
            }

            suggestionsBox.innerHTML = '';
            filtered.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = item;
                div.addEventListener('click', () => {
                    addTag(item);
                    hideSuggestions();
                });
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = 'block';
            container?.classList.add('active');
        }

        function hideSuggestions() {
            if (suggestionsBox) suggestionsBox.style.display = 'none';
            container?.classList.remove('active');
        }

        input.addEventListener('focus', () => {
            const val = input.value.toLowerCase();
            const filtered = dynamicGuideRows?.filter(item =>
                (val === '' || item.toLowerCase().includes(val)) && !tagsArray.includes(item)
            );
            showSuggestions(filtered);
        });

        input.addEventListener('input', () => {
            const val = input.value.toLowerCase();
            const filtered = dynamicGuideRows?.filter(item =>
                (val === '' || item.toLowerCase().includes(val)) && !tagsArray.includes(item)
            );
            showSuggestions(filtered);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const activeSuggestion = suggestionsBox?.querySelector('.suggestion-item.active');
                if (activeSuggestion) {
                    addTag(activeSuggestion.textContent);
                } else if (input.value.trim()) {
                    addTag(input.value);
                }
            } else if (e.key === 'ArrowDown' && suggestionsBox?.style.display === 'block') {
                e.preventDefault();
                const items = suggestionsBox.querySelectorAll('.suggestion-item');
                if (items.length === 0) return;
                let activeIdx = Array.from(items).findIndex(i => i.classList.contains('active'));
                items.forEach(i => i.classList.remove('active'));
                activeIdx = (activeIdx + 1) % items.length;
                items[activeIdx].classList.add('active');
                items[activeIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp' && suggestionsBox?.style.display === 'block') {
                e.preventDefault();
                const items = suggestionsBox.querySelectorAll('.suggestion-item');
                if (items.length === 0) return;
                let activeIdx = Array.from(items).findIndex(i => i.classList.contains('active'));
                items.forEach(i => i.classList.remove('active'));
                activeIdx = (activeIdx - 1 + items.length) % items.length;
                items[activeIdx].classList.add('active');
                items[activeIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Escape') {
                hideSuggestions();
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!container?.contains(e.target)) {
                hideSuggestions();
            }
        });

        tagsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                const index = parseInt(e.target.dataset.index);
                removeTag(index);
            }
        });

        // Expose render function for initial load
        window.renderGuideTags = function (data) {
            tagsArray.length = 0;
            if (data && data.length > 0) {
                data.forEach(item => {
                    const text = item.row_description || item.text || item;
                    if (text && !tagsArray.includes(text)) tagsArray.push(text);
                });
            }
            renderTags();
            updateHiddenInput();
        };
    }

    function renderValues(values) {
        valuesContainer.innerHTML = '';
        if (!values || values.length === 0) {
            addValueRow();
        } else {
            values.forEach(v => addValueRow(v));
        }
    }

    function addValueRow(data = {}) {
        const row = document.createElement('div');
        row.className = 'value-row content-card-inner';

        row.innerHTML = `
            <div class="form-group" style="width: 100%;">
                <input type="text" class="form-input value-title" value="${data.card_head || ''}" placeholder="Core Value Title">
            </div>
            <div class="form-group" style="width: 100%;">
                <textarea class="form-input value-desc" rows="3" placeholder="Description/Value" maxlength="200" style="height: auto; min-height: 100px; resize: vertical; padding-top: 12px;">${data.description_text || ''}</textarea>
                <div class="char-limit-msg" style="font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic">* Characters are more than 200</div>
            </div>
            <button type="button" class="delete-row-btn" title="Remove Value">
                <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M8 3H16C16.55 3 17 3.45 17 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H7V4C7 3.45 7.45 3 8 3ZM6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6ZM9 11C9.55 11 10 11.45 10 12V18C10 18.55 9.55 19 9 19C8.45 19 8 18.55 8 18V12C8 11.45 8.45 11 9 11ZM12 11C12.55 11 13 11.45 13 12V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V12C11 11.45 11.45 11 12 11ZM15 11C15.55 11 16 11.45 16 12V18C16 18.55 15.55 19 15 19C14.45 19 14 18.55 14 18V12C14 11.45 14.45 11 15 11Z"></path>
                </svg>
            </button>
        `;

        // Add delete handler
        row.querySelector('.delete-row-btn').addEventListener('click', function () {
            row.style.opacity = '0';
            row.style.transform = 'translateX(20px)';
            setTimeout(() => {
                row.remove();
                // If no rows left, add an empty one
                if (valuesContainer.children.length === 0) {
                    addValueRow();
                }
            }, 300);
        });

        valuesContainer.appendChild(row);
        setupValidation(row);
    }

    function renderGuide(buyer) {
        if (!buyer) return;
        document.getElementById('guide-title').value = buyer.heading?.title || '';
        document.getElementById('guide-description').value = buyer.heading?.description || '';

        if (window.renderGuideTags) {
            window.renderGuideTags(buyer.rows || []);
        }
    }


    const addValBtn = document.getElementById('add-value-btn');
    if (addValBtn) {
        addValBtn.addEventListener('click', () => {
            addValueRow();
        });
    }


    // Validation Logic
    function setupValidation(container = document) {
        container.querySelectorAll('.form-group, .guide-row div').forEach(parent => {
            const input = parent.querySelector('.form-input');
            if (!input) return;

            // Required Message
            let msg = parent.querySelector('.required-message');
            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'required-message';
                msg.textContent = '* This field is required';
                msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;';
                input.after(msg);
            }

            // Character Limit Message (for textareas with maxLength)
            if (input.tagName === 'TEXTAREA' && input.maxLength === 200) {
                let charMsg = parent.querySelector('.char-limit-msg');
                if (!charMsg) {
                    charMsg = document.createElement('div');
                    charMsg.className = 'char-limit-msg';
                    charMsg.textContent = '* Characters are more than 200';
                    charMsg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;';
                    input.after(charMsg);
                }
            }

            // Input Listener
            input.addEventListener('input', function () {
                const reqMsg = this.parentNode.querySelector('.required-message');
                if (reqMsg) reqMsg.style.display = 'none';

                if (this.tagName === 'TEXTAREA' && this.maxLength === 200) {
                    const charMsg = this.parentNode.querySelector('.char-limit-msg');
                    if (charMsg) {
                        charMsg.style.display = this.value.length >= 200 ? 'block' : 'none';
                    }
                }
            });
        });
    }


    function validateSection(sectionId) {
        let isValid = true;
        let firstInvalid = null;
        const section = document.getElementById(sectionId);

        section.querySelectorAll('.form-input').forEach(input => {
            // Skip hidden inputs used for tags
            if (input.type === 'hidden') return;

            const val = input.value.trim();
            const container = input.parentNode;
            const msg = container.querySelector('.required-message');

            if (!val) {
                isValid = false;
                if (msg) msg.style.display = 'block';
                if (!firstInvalid) firstInvalid = input;
            } else {
                if (msg) msg.style.display = 'none';
            }
        });

        // Tag Validation for Buyer's Guide
        if (sectionId === 'section-buyer-guide') {
            let msg = section.querySelector('.required-container-message');
            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'required-container-message';
                msg.textContent = '* At least one row description is required';
                msg.style.cssText = 'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic;';
                document.getElementById('guideTags').after(msg);
            }

            if (guideTags.length === 0) {
                isValid = false;
                msg.style.display = 'block';
                if (!firstInvalid) firstInvalid = document.getElementById('guideTagInput');
            } else {
                msg.style.display = 'none';
            }
        }

        if (!isValid && firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }

        return isValid;
    }

    // Save Handlers
    const saveValuesBtn = document.getElementById('save-values-btn');
    if (saveValuesBtn) {
        saveValuesBtn.addEventListener('click', () => {
            if (!validateSection('section-core-values')) return;

            const values = [];
            document.querySelectorAll('.value-row').forEach(row => {
                const head = row.querySelector('.value-title').value.trim();
                const desc = row.querySelector('.value-desc').value.trim();
                if (head || desc) {
                    values.push({ card_head: head, description_text: desc });
                }
            });

            // Change detection for Core Values
            const currentValuesData = JSON.stringify(values);
            if (originalValuesData !== null && currentValuesData === originalValuesData) {
                Swal.fire('No Changes', 'no changes is detected', 'info');
                return;
            }

            saveSection('value-container', values, () => {
                originalValuesData = currentValuesData;
            });
        });
    }

    const saveGuideBtn = document.getElementById('save-guide-btn');
    if (saveGuideBtn) {
        saveGuideBtn.addEventListener('click', () => {
            if (!validateSection('section-buyer-guide')) return;

            const title = document.getElementById('guide-title').value.trim();
            const description = document.getElementById('guide-description').value.trim();

            const rows = guideTags.map(tag => ({ row_description: tag }));

            const buyerContent = {
                heading: { title, description },
                rows: rows
            };

            // Change detection for Buyer's Guide
            const currentGuideData = JSON.stringify({
                title,
                description,
                rows: guideTags
            });
            if (originalGuideData !== null && currentGuideData === originalGuideData) {
                Swal.fire('No Changes', 'no changes is detected', 'info');
                return;
            }

            saveSection('buyer-container', buyerContent, () => {
                originalGuideData = currentGuideData;
            });
        });
    }

    function saveSection(section, data, onSuccess) {
        Swal.fire({
            title: 'Saving...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        fetch('/admin/discoverDetails/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                section: section,
                pageContent: JSON.stringify(data)
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.success) {
                    if (onSuccess) onSuccess();
                    Swal.fire('Saved!', 'content updated', 'success');
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            })
            .catch(() => {
                Swal.fire('Error', 'Server error', 'error');
            });
    }
});

