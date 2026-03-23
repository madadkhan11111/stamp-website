/**
 * Stampify - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       DOM ELEMENTS
       ========================================================================= */
    const UI = {
        // Navigation
        steps: {
            navBtns: document.querySelectorAll('.step-btn'),
            sections: document.querySelectorAll('.step-section')
        },
        themeToggle: document.getElementById('theme-toggle'),

        // Step 1: Stamp Creator
        stamp: {
            shapeInputs: document.querySelectorAll('input[name="stamp-shape"]'),
            shapeCards: document.querySelectorAll('.radio-card'),
            colorInput: document.getElementById('stamp-color'),
            colorHex: document.getElementById('color-hex-display'),
            presetColors: document.querySelectorAll('.preset-color'),
            
            // Text inputs
            outerText: document.getElementById('outer-text'),
            innerText: document.getElementById('inner-text'),
            dateText: document.getElementById('date-text'),
            
            rectTopText: document.getElementById('rect-top-text'),
            rectMidText: document.getElementById('rect-mid-text'),
            rectBotText: document.getElementById('rect-bot-text'),

            // New Features
            opacityInput: document.getElementById('stamp-opacity'),
            opacityVal: document.getElementById('opacity-val'),
            borderThicknessInput: document.getElementById('stamp-border-thickness'),
            borderVal: document.getElementById('border-val'),
            useCustomLogo: document.getElementById('use-custom-logo'),
            logoUploadGroup: document.getElementById('logo-upload-group'),
            logoUpload: document.getElementById('stamp-logo-upload'),

            // Fonts
            fontFamily: document.getElementById('font-family'),
            fontBold: document.getElementById('font-bold'),

            // Sizes
            outerTextSize: document.getElementById('outer-text-size'),
            innerTextSize: document.getElementById('inner-text-size'),
            dateTextSize: document.getElementById('date-text-size'),
            rectTopSize: document.getElementById('rect-top-size'),
            rectMidSize: document.getElementById('rect-mid-size'),
            rectBotSize: document.getElementById('rect-bot-size'),
            
            // Toggles & Sections
            circleControls: document.getElementById('circle-controls'),
            rectControls: document.getElementById('rect-controls'),
            addressControls: document.getElementById('address-controls'),
            distressToggle: document.getElementById('add-distress'),

            // Address inputs
            addrLine1: document.getElementById('addr-line1'),
            addrLine2: document.getElementById('addr-line2'),
            addrLine3: document.getElementById('addr-line3'),
            addrLine4: document.getElementById('addr-line4'),
            addrLine5: document.getElementById('addr-line5'),
            addrLine1Size: document.getElementById('addr-line1-size'),
            addrLine2Size: document.getElementById('addr-line2-size'),
            addrLine3Size: document.getElementById('addr-line3-size'),
            addrLine4Size: document.getElementById('addr-line4-size'),
            addrLine5Size: document.getElementById('addr-line5-size'),
            
            // Rendering
            canvas: document.getElementById('stamp-preview-canvas'),
            downloadBtn: document.getElementById('download-stamp-img'),
            proceedBtn: document.getElementById('proceed-to-doc-btn')
        },

        // Step 2: Document Stamper
        doc: {
            uploadContainer: document.getElementById('upload-container'),
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('document-upload'),
            
            workspace: document.getElementById('workspace-area'),
            changeDocBtn: document.getElementById('change-doc-btn'),
            exportBtn: document.getElementById('export-doc-btn'),
            
            viewerWrapper: document.getElementById('document-viewer-wrapper'),
            container: document.getElementById('document-container'),
            renderCanvas: document.getElementById('doc-render-canvas'),
            renderImg: document.getElementById('doc-render-image'),
            
            stampOverlay: document.getElementById('stamp-overlay'),
            stampOverlayImg: document.getElementById('stamp-overlay-img'),
            
            // Zoom & PDF controls
            zoomInBtn: document.getElementById('zoom-in'),
            zoomOutBtn: document.getElementById('zoom-out'),
            zoomLevel: document.getElementById('zoom-level'),

            // Rotation
            rotLeftBtn: document.getElementById('rot-left'),
            rotRightBtn: document.getElementById('rot-right'),
            rotLevel: document.getElementById('rot-level'),
            
            pdfControls: document.getElementById('pdf-controls'),
            prevPageBtn: document.getElementById('prev-page'),
            nextPageBtn: document.getElementById('next-page'),
            pageNumSpan: document.getElementById('page-num'),
            pageCountSpan: document.getElementById('page-count')
        },
        
        loading: {
            overlay: document.getElementById('loading-overlay'),
            text: document.getElementById('loading-text')
        }
    };

    /* =========================================================================
       STATE MANAGEMENT
       ========================================================================= */
    const state = {
        theme: 'dark',
        stamp: {
            shape: 'circle',
            color: '#E63946',
            circle: {
                outerText: UI.stamp.outerText.value,
                outerSize: parseInt(UI.stamp.outerTextSize.value, 10),
                innerText: UI.stamp.innerText.value,
                innerSize: parseInt(UI.stamp.innerTextSize.value, 10),
                dateText: UI.stamp.dateText.value,
                dateSize: parseInt(UI.stamp.dateTextSize.value, 10)
            },
            rect: {
                topText: UI.stamp.rectTopText.value,
                topSize: parseInt(UI.stamp.rectTopSize.value, 10),
                midText: UI.stamp.rectMidText.value,
                midSize: parseInt(UI.stamp.rectMidSize.value, 10),
                botText: UI.stamp.rectBotText.value,
                botSize: parseInt(UI.stamp.rectBotSize.value, 10)
            },
            address: {
                lines: [
                    { text: 'MH TRADERS', size: 28 },
                    { text: 'OFFICE NO: 505, TRADE AVENUE', size: 16 },
                    { text: 'HASRAT MOHANI ROAD,', size: 14 },
                    { text: 'I.I. CHUNDRIGAR ROAD, KARACHI.', size: 14 },
                    { text: 'C.H.A.L: # 9018599', size: 13 }
                ]
            },
            font: {
                family: "'Outfit', sans-serif",
                isBold: true
            },
            distress: false,
            opacity: 1.0,
            borderThickness: 4,
            useCustomLogo: false,
            customLogoImg: null, // HTMLImageElement
            dataUrl: null // Data URL of the generated stamp PNG
        },
        document: {
            file: null,
            type: null, // 'image' or 'pdf'
            pdfDoc: null,
            pageNum: 1,
            pageCount: 1,
            zoom: 1.0,
            originalWidth: 0,
            originalHeight: 0
        },
        draggable: {
            isDragging: false,
            isResizing: false,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            offsetX: 0,
            offsetY: 0,
            currentX: 0, // Relative to document container
            currentY: 0,
            width: 200,
            rotation: 0 // Degrees
        }
    };

    // Canvas Context
    const ctx = UI.stamp.canvas.getContext('2d', { willReadFrequently: true });

    /* =========================================================================
       INITIALIZATION
       ========================================================================= */
    function init() {
        setupEventListeners();
        renderStamp(); // Initial render
        checkCookieConsent();
    }

    function checkCookieConsent() {
        const banner = document.getElementById('cookie-banner');
        const btn = document.getElementById('accept-cookies');
        
        if (!localStorage.getItem('stampify_cookie_consent')) {
            // Slight delay so it slides up after load
            setTimeout(() => {
                banner.classList.add('show');
            }, 1000);
        }

        btn.addEventListener('click', () => {
            localStorage.setItem('stampify_cookie_consent', 'true');
            banner.classList.remove('show');
        });
    }

    function setupEventListeners() {
        // Theme Toggle
        UI.themeToggle.addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', state.theme);
            UI.themeToggle.innerHTML = state.theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        });

        // Navigation
        UI.steps.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(btn.disabled) return;
                const step = btn.getAttribute('data-step');
                goToStep(step);
            });
        });

        UI.stamp.proceedBtn.addEventListener('click', () => {
            // Generate final data URL before proceeding
            state.stamp.dataUrl = UI.stamp.canvas.toDataURL('image/png');
            UI.doc.stampOverlayImg.src = state.stamp.dataUrl;
            
            // Enable and navigate to step 2
            document.getElementById('nav-step-2').disabled = false;
            goToStep('2');
        });

        // Stamp Generator Inputs triggers re-render
        UI.stamp.shapeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                state.stamp.shape = e.target.value;
                
                // Update UI active states
                UI.stamp.shapeCards.forEach(card => card.classList.remove('active'));
                e.target.closest('.radio-card').classList.add('active');
                
                // Toggle controls
                UI.stamp.circleControls.classList.add('hidden');
                UI.stamp.rectControls.classList.add('hidden');
                UI.stamp.addressControls.classList.add('hidden');
                
                if (state.stamp.shape === 'circle') {
                    UI.stamp.circleControls.classList.remove('hidden');
                } else if (state.stamp.shape === 'address') {
                    UI.stamp.addressControls.classList.remove('hidden');
                } else if (state.stamp.shape === 'star') {
                    // Star uses rect controls (top/mid/bot text)
                    UI.stamp.rectControls.classList.remove('hidden');
                } else {
                    UI.stamp.rectControls.classList.remove('hidden');
                }
                
                renderStamp();
            });
        });

        UI.stamp.colorInput.addEventListener('input', (e) => updateColor(e.target.value));
        
        UI.stamp.presetColors.forEach(btn => {
            btn.addEventListener('click', (e) => {
                updateColor(e.target.dataset.color);
            });
        });

        // Text Inputs binding
        const bindInput = (el, statePath, key, isNumber = false) => {
            el.addEventListener('input', (e) => {
                statePath[key] = isNumber ? parseInt(e.target.value, 10) || 12 : e.target.value;
                renderStamp();
            });
        };

        bindInput(UI.stamp.outerText, state.stamp.circle, 'outerText');
        bindInput(UI.stamp.outerTextSize, state.stamp.circle, 'outerSize', true);
        bindInput(UI.stamp.innerText, state.stamp.circle, 'innerText');
        bindInput(UI.stamp.innerTextSize, state.stamp.circle, 'innerSize', true);
        bindInput(UI.stamp.dateText, state.stamp.circle, 'dateText');
        bindInput(UI.stamp.dateTextSize, state.stamp.circle, 'dateSize', true);
        
        bindInput(UI.stamp.rectTopText, state.stamp.rect, 'topText');
        bindInput(UI.stamp.rectTopSize, state.stamp.rect, 'topSize', true);
        bindInput(UI.stamp.rectMidText, state.stamp.rect, 'midText');
        bindInput(UI.stamp.rectMidSize, state.stamp.rect, 'midSize', true);
        bindInput(UI.stamp.rectBotText, state.stamp.rect, 'botText');
        bindInput(UI.stamp.rectBotSize, state.stamp.rect, 'botSize', true);

        // Border Thickness
        UI.stamp.borderThicknessInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            state.stamp.borderThickness = val;
            let label = 'Medium';
            if (val <= 2) label = 'Thin';
            else if (val >= 8) label = 'Thick';
            UI.stamp.borderVal.textContent = label;
            renderStamp();
        });

        // Address line bindings
        for (let i = 0; i < 5; i++) {
            const lineNum = i + 1;
            const textEl = UI.stamp['addrLine' + lineNum];
            const sizeEl = UI.stamp['addrLine' + lineNum + 'Size'];
            ((idx) => {
                textEl.addEventListener('input', (e) => { state.stamp.address.lines[idx].text = e.target.value; renderStamp(); });
                sizeEl.addEventListener('input', (e) => { state.stamp.address.lines[idx].size = parseInt(e.target.value, 10) || 12; renderStamp(); });
            })(i);
        }
        
        // New Feature Listeners
        UI.stamp.opacityInput.addEventListener('input', (e) => {
            state.stamp.opacity = parseFloat(e.target.value);
            UI.stamp.opacityVal.textContent = Math.round(state.stamp.opacity * 100) + '%';
            renderStamp();
        });

        UI.stamp.useCustomLogo.addEventListener('change', (e) => {
            state.stamp.useCustomLogo = e.target.checked;
            if (e.target.checked) {
                UI.stamp.logoUploadGroup.classList.remove('hidden');
                UI.stamp.innerText.disabled = true;
                UI.stamp.rectMidText.disabled = true;
            } else {
                UI.stamp.logoUploadGroup.classList.add('hidden');
                UI.stamp.innerText.disabled = false;
                UI.stamp.rectMidText.disabled = false;
            }
            renderStamp();
        });

        UI.stamp.logoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        // Create a temporary off-screen canvas to extract just the image data
                        // This allows us to cleanly re-tint it later
                        state.stamp.customLogoImg = img;
                        renderStamp();
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                state.stamp.customLogoImg = null;
                renderStamp();
            }
        });

        UI.stamp.distressToggle.addEventListener('change', (e) => {
            state.stamp.distress = e.target.checked;
            renderStamp();
        });

        // Font Options
        UI.stamp.fontFamily.addEventListener('change', (e) => {
            state.stamp.font.family = e.target.value;
            renderStamp();
        });

        UI.stamp.fontBold.addEventListener('change', (e) => {
            state.stamp.font.isBold = e.target.checked;
            renderStamp();
        });

        UI.stamp.downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'stampify-custom-stamp.png';
            link.href = UI.stamp.canvas.toDataURL('image/png');
            link.click();
        });

        // ==================== SAVE / LOAD PRESETS ====================
        const PRESETS_KEY = 'stampify_presets';

        function getPresets() {
            try { return JSON.parse(localStorage.getItem(PRESETS_KEY)) || []; }
            catch { return []; }
        }

        function savePresets(presets) {
            localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
        }

        function getCurrentStampConfig() {
            return {
                shape: state.stamp.shape,
                color: state.stamp.color,
                circle: { ...state.stamp.circle },
                rect: { ...state.stamp.rect },
                address: { lines: state.stamp.address.lines.map(l => ({ ...l })) },
                font: { ...state.stamp.font },
                distress: state.stamp.distress,
                opacity: state.stamp.opacity
            };
        }

        function applyPreset(config) {
            // Set state
            state.stamp.shape = config.shape;
            state.stamp.color = config.color;
            Object.assign(state.stamp.circle, config.circle);
            Object.assign(state.stamp.rect, config.rect);
            state.stamp.address.lines = config.address.lines.map(l => ({ ...l }));
            Object.assign(state.stamp.font, config.font);
            state.stamp.distress = config.distress;
            state.stamp.opacity = config.opacity;

            // Update UI elements to match state
            // Shape
            UI.stamp.shapeCards.forEach(c => c.classList.remove('active'));
            UI.stamp.shapeInputs.forEach(inp => {
                if (inp.value === config.shape) {
                    inp.checked = true;
                    inp.closest('.radio-card').classList.add('active');
                }
            });
            UI.stamp.circleControls.classList.add('hidden');
            UI.stamp.rectControls.classList.add('hidden');
            UI.stamp.addressControls.classList.add('hidden');
            if (config.shape === 'circle') UI.stamp.circleControls.classList.remove('hidden');
            else if (config.shape === 'address') UI.stamp.addressControls.classList.remove('hidden');
            else UI.stamp.rectControls.classList.remove('hidden');

            // Color
            UI.stamp.colorInput.value = config.color;
            document.getElementById('color-hex-display').textContent = config.color;

            // Circle text
            UI.stamp.outerText.value = config.circle.outerText;
            UI.stamp.outerTextSize.value = config.circle.outerSize;
            UI.stamp.innerText.value = config.circle.innerText;
            UI.stamp.innerTextSize.value = config.circle.innerSize;
            UI.stamp.dateText.value = config.circle.dateText;
            UI.stamp.dateTextSize.value = config.circle.dateSize;

            // Rect text
            UI.stamp.rectTopText.value = config.rect.topText;
            UI.stamp.rectTopSize.value = config.rect.topSize;
            UI.stamp.rectMidText.value = config.rect.midText;
            UI.stamp.rectMidSize.value = config.rect.midSize;
            UI.stamp.rectBotText.value = config.rect.botText;
            UI.stamp.rectBotSize.value = config.rect.botSize;

            // Address
            for (let i = 0; i < 5; i++) {
                UI.stamp['addrLine' + (i+1)].value = config.address.lines[i].text;
                UI.stamp['addrLine' + (i+1) + 'Size'].value = config.address.lines[i].size;
            }

            // Font
            UI.stamp.fontFamily.value = config.font.family;
            UI.stamp.fontBold.checked = config.font.isBold;

            // Effects
            UI.stamp.distressToggle.checked = config.distress;
            UI.stamp.opacityInput.value = config.opacity;
            UI.stamp.opacityVal.textContent = Math.round(config.opacity * 100) + '%';

            renderStamp();
        }

        function renderPresetsList() {
            const container = document.getElementById('presets-list');
            const presets = getPresets();
            if (presets.length === 0) {
                container.innerHTML = '<small style="color: var(--text-secondary); text-align: center;">No saved presets yet.</small>';
                return;
            }
            container.innerHTML = presets.map((p, i) => `
                <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.15); padding: 0.5rem 0.75rem; border-radius: 8px;">
                    <span style="flex-grow: 1; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <i class="fa-solid fa-stamp" style="color: ${p.config.color}; margin-right: 0.3rem;"></i> ${p.name}
                    </span>
                    <button class="secondary-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window._loadPreset(${i})">Load</button>
                    <button class="secondary-btn" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; color: var(--danger);" onclick="window._deletePreset(${i})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
        }

        // Expose for inline onclick
        window._loadPreset = (idx) => {
            const presets = getPresets();
            if (presets[idx]) applyPreset(presets[idx].config);
        };
        window._deletePreset = (idx) => {
            const presets = getPresets();
            presets.splice(idx, 1);
            savePresets(presets);
            renderPresetsList();
        };

        document.getElementById('save-preset-btn').addEventListener('click', () => {
            const nameInput = document.getElementById('preset-name');
            const name = nameInput.value.trim() || ('Stamp ' + (getPresets().length + 1));
            const presets = getPresets();
            presets.push({ name, config: getCurrentStampConfig() });
            savePresets(presets);
            nameInput.value = '';
            renderPresetsList();
        });

        // Initial render of presets list
        renderPresetsList();

        // Document Handling
        UI.doc.dropZone.addEventListener('click', () => UI.doc.fileInput.click());
        
        UI.doc.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            UI.doc.dropZone.classList.add('dragover');
        });
        
        UI.doc.dropZone.addEventListener('dragleave', () => {
            UI.doc.dropZone.classList.remove('dragover');
        });
        
        UI.doc.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            UI.doc.dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
        
        UI.doc.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileUpload(e.target.files[0]);
            }
        });

        // Workspace Controls
        UI.doc.changeDocBtn.addEventListener('click', () => {
            UI.doc.workspace.classList.add('hidden');
            UI.doc.uploadContainer.classList.remove('hidden');
            UI.doc.fileInput.value = '';
            state.document.file = null;
        });

        UI.doc.zoomInBtn.addEventListener('click', () => updateZoom(0.1));
        UI.doc.zoomOutBtn.addEventListener('click', () => updateZoom(-0.1));

        // Rotation
        UI.doc.rotLeftBtn.addEventListener('click', () => updateRotation(-15));
        UI.doc.rotRightBtn.addEventListener('click', () => updateRotation(15));

        UI.doc.prevPageBtn.addEventListener('click', () => changePdfPage(-1));
        UI.doc.nextPageBtn.addEventListener('click', () => changePdfPage(1));

        // Setup Draggable Stamp
        setupDraggableStamp();

        // Export Document
        UI.doc.exportBtn.addEventListener('click', exportDocument);
    }

    /* =========================================================================
       DOCUMENT HANDLING
       ========================================================================= */
    async function handleFileUpload(file) {
        if (!file) return;

        // Reset state
        state.document.file = file;
        state.document.zoom = 1.0;
        updateZoomDisplay();

        const isPdf = file.type === 'application/pdf';
        state.document.type = isPdf ? 'pdf' : 'image';

        UI.doc.uploadContainer.classList.add('hidden');
        UI.doc.workspace.classList.remove('hidden');

        showLoading('Loading document...');

        try {
            if (isPdf) {
                await loadPdf(file);
                UI.doc.pdfControls.classList.remove('hidden');
            } else {
                await loadImage(file);
                UI.doc.pdfControls.classList.add('hidden');
            }
            // Center the stamp initially
            centerStamp();
        } catch (err) {
            console.error('Error loading file:', err);
            alert('Could not load the document. Please try a different file.');
            UI.doc.changeDocBtn.click();
        } finally {
            hideLoading();
        }
    }

    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                UI.doc.renderCanvas.style.display = 'none';
                UI.doc.renderImg.style.display = 'block';
                UI.doc.renderImg.src = e.target.result;
                
                UI.doc.renderImg.onload = () => {
                    state.document.originalWidth = UI.doc.renderImg.naturalWidth;
                    state.document.originalHeight = UI.doc.renderImg.naturalHeight;
                    setContainerSize(state.document.originalWidth, state.document.originalHeight);
                    resolve();
                };
                UI.doc.renderImg.onerror = reject;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function loadPdf(file) {
        const fileReader = new FileReader();
        
        return new Promise((resolve, reject) => {
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    state.document.pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
                    state.document.pageCount = state.document.pdfDoc.numPages;
                    state.document.pageNum = 1;
                    
                    UI.doc.pageCountSpan.textContent = state.document.pageCount;
                    updatePdfPageControls();
                    
                    await renderPdfPage(state.document.pageNum);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            fileReader.readAsArrayBuffer(file);
        });
    }

    async function renderPdfPage(num) {
        UI.doc.renderImg.style.display = 'none';
        UI.doc.renderCanvas.style.display = 'block';

        const page = await state.document.pdfDoc.getPage(num);
        
        // Base scale 
        // We render at roughly 1.5x pixel ratio for crispness but CSS downscales
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = UI.doc.renderCanvas;
        const ctx = canvas.getContext('2d');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        state.document.originalWidth = viewport.width;
        state.document.originalHeight = viewport.height;
        
        setContainerSize(viewport.width, viewport.height);

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
    }

    function changePdfPage(delta) {
        const newNum = state.document.pageNum + delta;
        if (newNum < 1 || newNum > state.document.pageCount) return;
        
        state.document.pageNum = newNum;
        UI.doc.pageNumSpan.textContent = newNum;
        updatePdfPageControls();
        
        showLoading('Rendering page...');
        renderPdfPage(newNum).then(hideLoading);
    }

    function updatePdfPageControls() {
        UI.doc.prevPageBtn.disabled = state.document.pageNum <= 1;
        UI.doc.nextPageBtn.disabled = state.document.pageNum >= state.document.pageCount;
    }

    /* =========================================================================
       WORKSPACE CONTROLS (Zoom & Layout)
       ========================================================================= */
    function setContainerSize(w, h) {
        // Find best fit zoom scale initially
        const wrapper = UI.doc.viewerWrapper;
        const wrapperW = wrapper.clientWidth - 40; // padding
        const wrapperH = wrapper.clientHeight - 40;
        
        // Calculate fit scale
        const scaleW = wrapperW / w;
        const scaleH = wrapperH / h;
        let bestScale = Math.min(scaleW, scaleH, 1.0); // Don't zoom in initially beyond 100%
        
        state.document.zoom = Number(Math.max(0.2, Math.min(bestScale, 3.0)).toFixed(2));
        updateZoomDisplay();
        
        UI.doc.container.style.width = `${w}px`;
        UI.doc.container.style.height = `${h}px`;
        applyZoom();
    }

    function updateZoom(delta) {
        let newZoom = state.document.zoom + delta;
        newZoom = Math.max(0.1, Math.min(newZoom, 3.0));
        state.document.zoom = newZoom;
        updateZoomDisplay();
        applyZoom();
    }

    function updateZoomDisplay() {
        UI.doc.zoomLevel.textContent = `${Math.round(state.document.zoom * 100)}%`;
    }

    function applyZoom() {
        UI.doc.container.style.transform = `scale(${state.document.zoom})`;
    }

    function updateRotation(delta) {
        state.draggable.rotation = (state.draggable.rotation + delta) % 360;
        UI.doc.rotLevel.textContent = `${state.draggable.rotation}°`;
        updateStampDOM();
    }

    function centerStamp() {
        // Place the stamp exactly in the center of the rendered container
        state.draggable.currentX = state.document.originalWidth / 2;
        state.draggable.currentY = state.document.originalHeight / 2;
        state.draggable.width = 200; // default size
        updateStampDOM();
    }

    /* =========================================================================
       DRAGGABLE STAMP LOGIC
       ========================================================================= */
    function setupDraggableStamp() {
        const overlay = UI.doc.stampOverlay;
        const handle = overlay.querySelector('.resize-handle');
        
        // Drag logic
        overlay.addEventListener('mousedown', (e) => {
            if (e.target === handle) return; // Let resize handle manage itself
            
            state.draggable.isDragging = true;
            // Get initial mouse position
            state.draggable.startX = e.clientX;
            state.draggable.startY = e.clientY;
        });

        // Resize Logic
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // prevent drag
            state.draggable.isResizing = true;
            state.draggable.startX = e.clientX;
            state.draggable.startY = e.clientY;
            state.draggable.startWidth = state.draggable.width;
            
            // Calculate a ratio to lock aspect ratio (since our stamps are square-ish)
        });

        document.addEventListener('mousemove', (e) => {
            if (state.draggable.isDragging) {
                const dx = e.clientX - state.draggable.startX;
                const dy = e.clientY - state.draggable.startY;
                
                // Account for zoom when calculating pixel movement over the document!
                const effectiveDx = dx / state.document.zoom;
                const effectiveDy = dy / state.document.zoom;
                
                state.draggable.currentX += effectiveDx;
                state.draggable.currentY += effectiveDy;
                
                state.draggable.startX = e.clientX;
                state.draggable.startY = e.clientY;
                
                updateStampDOM();
            }
            
            if (state.draggable.isResizing) {
                const dx = e.clientX - state.draggable.startX;
                // Simple resize relative to movement
                // again, account for zoom
                const newWidth = state.draggable.startWidth + (dx / state.document.zoom) * 2;
                
                // Limit resize
                if (newWidth > 50 && newWidth < Math.min(state.document.originalWidth, 1000)) {
                    state.draggable.width = newWidth;
                    updateStampDOM();
                }
            }
        });

        document.addEventListener('mouseup', () => {
            state.draggable.isDragging = false;
            state.draggable.isResizing = false;
        });

        // Touch Support
        overlay.addEventListener('touchstart', (e) => {
            if (e.target === handle) return;
            const touch = e.touches[0];
            state.draggable.isDragging = true;
            state.draggable.startX = touch.clientX;
            state.draggable.startY = touch.clientY;
        }, { passive: true });

        handle.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            state.draggable.isResizing = true;
            state.draggable.startX = touch.clientX;
            state.draggable.startY = touch.clientY;
            state.draggable.startWidth = state.draggable.width;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!state.draggable.isDragging && !state.draggable.isResizing) return;
            
            const touch = e.touches[0];
            
            if (state.draggable.isDragging) {
                const dx = touch.clientX - state.draggable.startX;
                const dy = touch.clientY - state.draggable.startY;
                
                state.draggable.currentX += (dx / state.document.zoom);
                state.draggable.currentY += (dy / state.document.zoom);
                
                state.draggable.startX = touch.clientX;
                state.draggable.startY = touch.clientY;
                updateStampDOM();
            }
            
            if (state.draggable.isResizing) {
                const dx = touch.clientX - state.draggable.startX;
                const newWidth = state.draggable.startWidth + (dx / state.document.zoom) * 2;
                if (newWidth > 50 && newWidth < Math.min(state.document.originalWidth, 1000)) {
                    state.draggable.width = newWidth;
                    updateStampDOM();
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            state.draggable.isDragging = false;
            state.draggable.isResizing = false;
        });
    }

    function updateStampDOM() {
        const overlay = UI.doc.stampOverlay;
        
        // Boundaries
        const halfW = state.draggable.width / 2;
        
        // Clamp to document edges
        state.draggable.currentX = Math.max(halfW, Math.min(state.document.originalWidth - halfW, state.draggable.currentX));
        state.draggable.currentY = Math.max(halfW, Math.min(state.document.originalHeight - halfW, state.draggable.currentY));
        
        // Since transform is translate(-50%, -50%), left/top represents the exact CENTER of the stamp
        overlay.style.left = `${state.draggable.currentX}px`;
        overlay.style.top = `${state.draggable.currentY}px`;
        overlay.style.transform = `translate(-50%, -50%) rotate(${state.draggable.rotation}deg)`;
        
        const img = UI.doc.stampOverlayImg;
        img.style.width = `${state.draggable.width}px`;
        // Keep square aspect ratio for the stamp img container
        img.style.height = `${state.draggable.width}px`;
    }

    /* =========================================================================
       EXPORT / DOWNLOAD
       ========================================================================= */
    async function exportDocument() {
        showLoading('Generating final document...');
        
        try {
            if (state.document.type === 'image') {
                await exportAsImage();
            } else {
                await exportAsPdf();
            }
        } catch (err) {
            console.error("Export error:", err);
            alert("An error occurred during export. Please try again.");
        } finally {
            hideLoading();
        }
    }

    async function exportAsImage() {
        // Create an offscreen canvas to merge
        const c = document.createElement('canvas');
        c.width = state.document.originalWidth;
        c.height = state.document.originalHeight;
        const ctx = c.getContext('2d');

        // Draw the background image
        ctx.drawImage(UI.doc.renderImg, 0, 0, c.width, c.height);

        // Calculate stamp position (top-left coords)
        const stampW = state.draggable.width;
        // The img is square, so height = width
        const stampX = state.draggable.currentX - (stampW / 2);
        const stampY = state.draggable.currentY - (stampW / 2);

        // Create an Image object for the stamp data URL
        const stampImg = new Image();
        stampImg.src = state.stamp.dataUrl;
        
        await new Promise(resolve => stampImg.onload = resolve);
        
        // Draw the stamp over the background with rotation
        ctx.save();
        // Translate to the center coordinate for rotation
        ctx.translate(state.draggable.currentX, state.draggable.currentY);
        // Rotate the canvas around the center
        ctx.rotate(state.draggable.rotation * Math.PI / 180);
        // Draw the stamp image offset by half its width/height so it's centered
        ctx.drawImage(stampImg, -stampW / 2, -stampW / 2, stampW, stampW);
        ctx.restore();

        // Download
        const link = document.createElement('a');
        link.download = `stamped_${state.document.file.name}`;
        link.href = c.toDataURL(state.document.file.type || 'image/png');
        link.click();
    }

    async function exportAsPdf() {
        // Use pdf-lib to load existing, draw stamp on current page, and save
        const existingPdfBytes = await state.document.file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        
        // Get all pages to apply the stamp to every page
        const pages = pdfDoc.getPages();
        
        // Embed stamp png once
        const pngImageBytes = await fetch(state.stamp.dataUrl).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngImageBytes);
        
        // Apply to ALL pages
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width: pdfPageW, height: pdfPageH } = page.getSize();
            
            // Map the visual coordinates to PDF coordinates for this specific page
            const scaleX = pdfPageW / state.document.originalWidth;
            const scaleY = pdfPageH / state.document.originalHeight;
            
            const stampVisualW = state.draggable.width;
            const stampVisualX = state.draggable.currentX - (stampVisualW / 2); // left
            const stampVisualY = state.draggable.currentY + (stampVisualW / 2); // bottom visual edge
            
            const stampPdfW = stampVisualW * scaleX;
            const stampPdfH = stampVisualW * scaleY; // assumes square
            const stampPdfX = stampVisualX * scaleX;
            // Invert Y coordinate
            const stampPdfY = pdfPageH - (stampVisualY * scaleY);
            
            // TODO: If you ever want to add PDF rotation, pdf-lib rotates around the bottom-left corner.
            // For now, we place it exactly where it is visually.
            page.drawImage(pngImage, {
                x: stampPdfX,
                y: stampPdfY,
                width: stampPdfW,
                height: stampPdfH,
            });
        }
        
        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `stamped_${state.document.file.name}`;
        link.click();
    }

    /* =========================================================================
       HELPER FUNCTIONS
       ========================================================================= */
    function goToStep(step) {
        UI.steps.navBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.step-btn[data-step="${step}"]`).classList.add('active');
        
        UI.steps.sections.forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');
    }

    function updateColor(hex) {
        state.stamp.color = hex;
        UI.stamp.colorInput.value = hex;
        UI.stamp.colorHex.textContent = hex.toUpperCase();
        
        UI.stamp.presetColors.forEach(b => {
            if(b.dataset.color.toUpperCase() === hex.toUpperCase()) b.classList.add('active');
            else b.classList.remove('active');
        });
        
        renderStamp();
    }

    function showLoading(msg) {
        UI.loading.text.textContent = msg;
        UI.loading.overlay.classList.remove('hidden');
    }

    function hideLoading() {
        UI.loading.overlay.classList.add('hidden');
    }

    /* =========================================================================
       STAMP RENDERING ENGINE (Canvas)
       ========================================================================= */
    // Debounce timer for renderStamp to prevent overlapping SVG loads
    let isRendering = false;
    let renderPending = false;

    /**
     * Main render function - draws everything onto the canvas based on `state`
     */
    async function renderStamp() {
        if (isRendering) {
            renderPending = true;
            return;
        }
        isRendering = true;
        
        try {
            const size = UI.stamp.canvas.width;
            const center = size / 2;
            
            ctx.clearRect(0, 0, UI.stamp.canvas.width, UI.stamp.canvas.height);
            
            // Save state before applying any transformations
            ctx.save();
        
        // Apply global opacity
        ctx.globalAlpha = state.stamp.opacity;
        
        ctx.strokeStyle = state.stamp.color;
        ctx.fillStyle = state.stamp.color;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Helper to detect RTL characters (Arabic, Persian, Urdu, Hebrew)
        const isRTL = (text) => {
            if (!text) return false;
            // Regex matches Arabic/Urdu/Persian (0600-06FF, 0750-077F, etc.) and Hebrew (0590-05FF)
            const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
            return rtlRegex.test(text);
        };

        // Check if any of the main text fields contain RTL characters
        // We do a combined check to see if the overall stamp needs RTL rendering
        let hasRTL = false;
        if (state.stamp.shape === 'circle') {
            hasRTL = isRTL(state.stamp.circle.outerText) || isRTL(state.stamp.circle.innerText) || isRTL(state.stamp.circle.dateText);
        } else if (state.stamp.shape.includes('rect') || state.stamp.shape === 'oval' || state.stamp.shape === 'diamond' || state.stamp.shape === 'star') {
            hasRTL = isRTL(state.stamp.rect.topText) || isRTL(state.stamp.rect.midText) || isRTL(state.stamp.rect.botText);
        } else if (state.stamp.shape === 'address') {
            hasRTL = isRTL(state.stamp.address.line1) || isRTL(state.stamp.address.line2) || isRTL(state.stamp.address.line3) || isRTL(state.stamp.address.line4) || isRTL(state.stamp.address.line5);
        }

        ctx.direction = hasRTL ? 'rtl' : 'ltr';

        switch(state.stamp.shape) {
            case 'circle': await renderCircularStamp(center); break;
            case 'rectangle': renderRectangularStamp(center, size, false); break;
            case 'rounded': renderRectangularStamp(center, size, true); break;
            case 'oval': renderOvalStamp(center, size); break;
            case 'diamond': renderDiamondStamp(center, size); break;
            case 'address': renderAddressStamp(center, size); break;
            case 'star': renderStarStamp(center, size); break;
        }

        if (state.stamp.distress) {
            applyDistressEffect(size);
        }

        ctx.restore();
        } finally {
            isRendering = false;
            // If another render was requested while we were rendering, fire it now
            if (renderPending) {
                renderPending = false;
                requestAnimationFrame(renderStamp);
            }
        }
    }

    function getFontStr(baseSizePx, isBoldOverride = null) {
        const isBold = isBoldOverride !== null ? isBoldOverride : state.stamp.font.isBold;
        const weight = isBold ? 'bold' : 'normal';
        return `${weight} ${baseSizePx}px ${state.stamp.font.family}`;
    }

    async function renderCircularStamp(center) {
        // Draw Outer Rings
        const outerRadius = 180;
        const innerRadius = 130;
        
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center, center, outerRadius - 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Outer Text along a path (using SVG for perfect shaping)
        if (state.stamp.circle.outerText) {
            ctx.font = getFontStr(state.stamp.circle.outerSize);
            const textToDraw = state.stamp.circle.outerText.toUpperCase() + ' ';
            await drawTextAlongArcSVG(ctx, textToDraw, center, center, 155, false);
        }

        // 6. Draw Bottom Arc Text (Date/Bottom)
        // Removed: User requested the date not to be on the ring
        // if (state.stamp.circle.dateText) {
        //     ctx.font = getFontStr(state.stamp.circle.dateSize, false);
        //     const textRadiusBot = ringCenter - (state.stamp.circle.dateSize / 3);
        //     await drawTextAlongArcSVG(ctx, state.stamp.circle.dateText, center, center, textRadiusBot, true);
        // }

        // 7. Draw Inner Layout (Center Content)
        
        // Horizontal Dividers framing the center text
        const dividerWidth = innerRadius - 20;
        const boxHeight = 40;
        const t = state.stamp.borderThickness; // Assuming borderThickness is available in state.stamp
        
        ctx.lineWidth = Math.max(1.5, t - 1);
        
        // Top divider
        ctx.beginPath();
        ctx.moveTo(center - dividerWidth, center - boxHeight);
        ctx.lineTo(center + dividerWidth, center - boxHeight);
        ctx.stroke();
        
        // Bottom divider
        ctx.beginPath();
        ctx.moveTo(center - dividerWidth, center + boxHeight);
        ctx.lineTo(center + dividerWidth, center + boxHeight);
        ctx.stroke();

        // Inner Texts or Custom Logo
        if (state.stamp.useCustomLogo && state.stamp.customLogoImg) {
            drawTintedLogo(ctx, state.stamp.customLogoImg, center, center, 140, state.stamp.color);
        } else {
            ctx.font = getFontStr(state.stamp.circle.innerSize);
            // Move center text up slightly to make room for date
            const textYOffset = state.stamp.circle.dateText ? -10 : 0;
            ctx.fillText(state.stamp.circle.innerText.toUpperCase(), center, center + textYOffset, 240);
        }

        // Draw Date Text in the center below the main text
        if (state.stamp.circle.dateText) {
            ctx.font = getFontStr(state.stamp.circle.dateSize, false);
            // Draw date below the inner text, but above the bottom divider
            const dateYOffset = state.stamp.circle.innerText ? 20 : 0;
            ctx.fillText(state.stamp.circle.dateText, center, center + dateYOffset, 240);
        }
    }

    function renderRectangularStamp(center, size, isRounded = false) {
        const width = 360;
        const height = 220;
        const x = center - width/2;
        const y = center - height/2;

        // Draw Borders
        ctx.lineWidth = 6;
        ctx.beginPath();
        if (isRounded) {
            ctx.roundRect(x, y, width, height, 20);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.roundRect(x + 8, y + 8, width - 16, height - 16, 12);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, width, height);

            ctx.lineWidth = 2;
            ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);
        }

        // Dividers
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 60);
        ctx.lineTo(x + width - 10, y + 60);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 10, y + height - 50);
        ctx.lineTo(x + width - 10, y + height - 50);
        ctx.stroke();

        // Texts or Custom Logo
        ctx.font = getFontStr(state.stamp.rect.topSize);
        ctx.fillText(state.stamp.rect.topText.toUpperCase(), center, y + 35, 340);

        if (state.stamp.useCustomLogo && state.stamp.customLogoImg) {
            drawTintedLogo(ctx, state.stamp.customLogoImg, center, center, 110, state.stamp.color);
        } else {
            ctx.font = getFontStr(state.stamp.rect.midSize);
            ctx.fillText(state.stamp.rect.midText.toUpperCase(), center, center, 340);
        }

        ctx.font = getFontStr(state.stamp.rect.botSize, false);
        ctx.fillText(state.stamp.rect.botText, center, y + height - 25, 340);
    }

    /**
     * Draws an image centered at (cx, cy) retaining its aspect ratio,
     * and tints it to the specified color.
     */
    function drawTintedLogo(context, img, cx, cy, maxSize, color) {
        // Calculate aspect ratio
        const ratio = img.naturalWidth / img.naturalHeight;
        let drawW = maxSize;
        let drawH = maxSize;

        if (ratio > 1) {
            drawH = maxSize / ratio;
        } else {
            drawW = maxSize * ratio;
        }

        const drawX = cx - (drawW / 2);
        const drawY = cy - (drawH / 2);

        // To tint the image, we draw it, then use source-in to tint it.
        // We need to do this in a temporary layer so it only affects the logo.
        const offCanvas = document.createElement('canvas');
        offCanvas.width = drawW;
        offCanvas.height = drawH;
        const octx = offCanvas.getContext('2d');

        // Draw the image
        octx.drawImage(img, 0, 0, drawW, drawH);

        // Tint it
        octx.globalCompositeOperation = 'source-in';
        octx.fillStyle = color;
        octx.fillRect(0, 0, drawW, drawH);

        // Draw tinted result onto main canvas
        context.drawImage(offCanvas, drawX, drawY);
    }

    /**
     * Helper to draw text in a circle gracefully without overflowing
     */

    function renderOvalStamp(center, size) {
        const width = 360;
        const height = 220;
        const x = center;
        const y = center;
        const rx = width / 2;
        const ry = height / 2;

        // Draw Borders
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, rx - 8, ry - 8, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // Texts
        const textYStart = center - height/2;
        ctx.font = getFontStr(state.stamp.rect.topSize);
        ctx.fillText(state.stamp.rect.topText.toUpperCase(), center, textYStart + 55, 260);

        if (state.stamp.useCustomLogo && state.stamp.customLogoImg) {
            drawTintedLogo(ctx, state.stamp.customLogoImg, center, center, 110, state.stamp.color);
        } else {
            ctx.font = getFontStr(state.stamp.rect.midSize);
            ctx.fillText(state.stamp.rect.midText.toUpperCase(), center, center, 320);
        }

        ctx.font = getFontStr(state.stamp.rect.botSize, false);
        ctx.fillText(state.stamp.rect.botText, center, textYStart + height - 42, 260);
    }

    function renderDiamondStamp(center, size) {
        const width = 360; // total width
        const height = 260; // total height
        const x = center;
        const y = center;

        function drawDiamondPath(cx, cy, w, h) {
            ctx.beginPath();
            ctx.moveTo(cx, cy - h/2); // Top
            ctx.lineTo(cx + w/2, cy); // Right
            ctx.lineTo(cx, cy + h/2); // Bottom
            ctx.lineTo(cx - w/2, cy); // Left
            ctx.closePath();
        }

        // Draw Borders
        ctx.lineWidth = 6;
        drawDiamondPath(x, y, width, height);
        ctx.stroke();

        ctx.lineWidth = 2;
        drawDiamondPath(x, y, width - 24, height - 18);
        ctx.stroke();

        // Texts
        ctx.font = getFontStr(state.stamp.rect.topSize);
        ctx.fillText(state.stamp.rect.topText.toUpperCase(), center, center - 60, 180);

        if (state.stamp.useCustomLogo && state.stamp.customLogoImg) {
            drawTintedLogo(ctx, state.stamp.customLogoImg, center, center, 90, state.stamp.color);
        } else {
            ctx.font = getFontStr(state.stamp.rect.midSize);
            ctx.fillText(state.stamp.rect.midText.toUpperCase(), center, center, 280);
        }

        ctx.font = getFontStr(state.stamp.rect.botSize, false);
        ctx.fillText(state.stamp.rect.botText, center, center + 60, 180);
    }

    function renderAddressStamp(center, size) {
        const lines = state.stamp.address.lines;
        const padding = 20;
        const lineSpacing = 6;
        
        // Calculate total height based on all lines
        let totalTextHeight = 0;
        const lineHeights = [];
        for (const line of lines) {
            if (line.text.trim()) {
                const h = line.size + lineSpacing;
                lineHeights.push(h);
                totalTextHeight += h;
            } else {
                lineHeights.push(0);
            }
        }
        totalTextHeight -= lineSpacing; // Remove extra spacing after last line
        
        const height = totalTextHeight + padding * 2;
        const width = 380;
        const x = center - width / 2;
        const y = center - height / 2;
        const t = state.stamp.borderThickness;

        // Borders removed as per user request to remove "brackets"
        // Draw outer border
        // ctx.lineWidth = t;
        // ctx.strokeRect(x, y, width, height);

        // Draw inner border
        // ctx.lineWidth = Math.max(0.5, t - 2.5);
        // ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);

        // Draw text lines — centered horizontally
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        let curY = y + padding;

        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].text.trim()) continue;
            const isBoldLine = (i === 0); // First line (company name) is always bold
            ctx.font = getFontStr(lines[i].size, isBoldLine ? true : null);
            ctx.fillText(lines[i].text.toUpperCase(), center, curY, width - padding * 2);
            curY += lines[i].size + lineSpacing;
        }
        
        ctx.textBaseline = 'middle'; // Reset
    }

    function renderStarStamp(center, size) {
        const outerR = 180;
        const innerR = 100;
        const points = 12;
        const t = state.stamp.borderThickness;

        // Draw star outline
        ctx.lineWidth = t + 1;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI / points) * i - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner circle
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center, center, innerR - 10, 0, Math.PI * 2);
        ctx.stroke();

        // Text
        ctx.font = getFontStr(state.stamp.rect.topSize);
        ctx.fillText(state.stamp.rect.topText.toUpperCase(), center, center - 35, 160);

        if (state.stamp.useCustomLogo && state.stamp.customLogoImg) {
            drawTintedLogo(ctx, state.stamp.customLogoImg, center, center + 5, 80, state.stamp.color);
        } else {
            ctx.font = getFontStr(state.stamp.rect.midSize);
            ctx.fillText(state.stamp.rect.midText.toUpperCase(), center, center + 5, 160);
        }

        ctx.font = getFontStr(state.stamp.rect.botSize, false);
        ctx.fillText(state.stamp.rect.botText, center, center + 45, 160);
    }

    /**
     * Draws text along an arc using an SVG <textPath> approach.
     * This fully supports complex RTL ligatures (Urdu, Arabic) flawlessly 
     * because it delegates text shaping to the browser's native SVG engine.
     */
    async function drawTextAlongArcSVG(context, str, centerX, centerY, radius, isBottom = false) {
        if (!str) return;
        
        const size = radius * 2 + 100; // Pad for font size
        
        // Define an SVG circular path
        let pathD;
        // To allow maximum text length before clipping, the path must start exactly 180 degrees
        // away from where the text will be anchored. 
        if (!isBottom) {
            // Top Text: Anchor is at 12 o'clock.
            // Path starts at 6 o'clock (bottom center), draws clockwise up the left side, then down the right side.
            pathD = `
                M ${size/2}, ${size/2 + radius} 
                a ${radius},${radius} 0 0,1 0,-${radius*2} 
                a ${radius},${radius} 0 0,1 0,${radius*2}
            `;
        } else {
            // Bottom Text: Anchor is at 6 o'clock.
            // Path starts at 12 o'clock (top center), draws counter-clockwise down the left side, then up the right side.
            pathD = `
                M ${size/2}, ${size/2 - radius} 
                a ${radius},${radius} 0 0,0 0,${radius*2} 
                a ${radius},${radius} 0 0,0 0,-${radius*2}
            `;
        }
        const color = context.fillStyle;

        // Extract font properties directly from state since parsing context.font is unreliable across browsers
        // We know exactly what the font is because we just set it before calling this function.
        let isBold = context.font.includes('bold');
        let fontSizeMatch = context.font.match(/(\d+)px/);
        let fontSize = fontSizeMatch ? fontSizeMatch[1] : 24;
        let fontFamily = state.stamp.font.family.replace(/["']/g, '');

        // Escape text for XML to prevent breaking the SVG markup
        const escapedStr = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // startOffset="50%" places the middle of the text exactly halfway along the path.
        // For the top text path, halfway is 12 o'clock. For the bottom text path, halfway is 6 o'clock.
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" xml:space="preserve">
                <path id="curve" d="${pathD}" fill="transparent" />
                <text fill="${color}" font-family="${fontFamily}" font-size="${fontSize}px" font-weight="${isBold ? 'bold' : 'normal'}" text-anchor="middle" dominant-baseline="central" xml:space="preserve">
                    <textPath href="#curve" startOffset="50%" xml:space="preserve">${escapedStr}</textPath>
                </text>
            </svg>
        `;

        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                // Draw SVG onto canvas
                context.save();
                // Since our SVG viewBox and path are naturally centered on size/2, 
                // we draw it centered on the target coordinate
                context.drawImage(img, centerX - size/2, centerY - size/2, size, size);
                context.restore();
                resolve();
            };
            img.onerror = (e) => {
                console.error("SVG Image Load Error:", e);
                reject(e);
            };
        });
    }

    /**
     * Applies a grungy/distressed mask effect to the canvas pixels
     */
    function applyDistressEffect(size) {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Simple noise application to alpha channel
        for (let i = 0; i < data.length; i += 4) {
            // Only affect pixels that are not fully transparent
            if (data[i+3] > 0) {
                // Generate some noise threshold based on coords to group pixels
                const x = (i / 4) % size;
                const y = Math.floor((i / 4) / size);
                
                // create some clustered noise
                const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.random();
                if (noise > 0.4 || Math.random() > 0.95) {
                    data[i+3] = 0; // Make transparent
                } else if (noise > 0.2) {
                    data[i+3] = Math.floor(data[i+3] * 0.5); // Semi transparent
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // Initialize
    // ==================== QUICK TEMPLATES ====================
    function applyTemplate(text, color, isBold = true, isRect = true) {
        state.stamp.color = color;
        UI.stamp.colorInput.value = color;
        document.getElementById('color-hex-display').textContent = color;
        
        state.stamp.font.isBold = isBold;
        UI.stamp.fontBold.checked = isBold;

        if (isRect) {
            state.stamp.shape = 'rect';
            state.stamp.rect.topText = '';
            state.stamp.rect.midText = text;
            state.stamp.rect.botText = Date.now().toString().slice(0, 10);
            
            UI.stamp.rectTopText.value = state.stamp.rect.topText;
            UI.stamp.rectMidText.value = state.stamp.rect.midText;
            UI.stamp.rectBotText.value = state.stamp.rect.botText;
        } else {
            state.stamp.shape = 'circle';
            state.stamp.circle.outerText = text;
            state.stamp.circle.innerText = '★ VERIFIED ★';
            
            UI.stamp.outerText.value = state.stamp.circle.outerText;
            UI.stamp.innerText.value = state.stamp.circle.innerText;
        }

        // Trigger UI shape update
        const shapeInput = document.querySelector(`input[name="stamp-shape"][value="${state.stamp.shape}"]`);
        if (shapeInput) {
            shapeInput.checked = true;
            shapeInput.dispatchEvent(new Event('change'));
        } else {
            renderStamp();
        }
    }

    document.getElementById('tpl-approved').addEventListener('click', () => applyTemplate('APPROVED', '#16a34a'));
    document.getElementById('tpl-paid').addEventListener('click', () => applyTemplate('PAID', '#16a34a'));
    document.getElementById('tpl-confidential').addEventListener('click', () => applyTemplate('CONFIDENTIAL', '#dc2626'));
    document.getElementById('tpl-received').addEventListener('click', () => applyTemplate('RECEIVED', '#2563eb'));
    document.getElementById('tpl-draft').addEventListener('click', () => applyTemplate('DRAFT', '#d97706', true, false));

    // ==================== INITIALIZATION ====================
    init();

});
