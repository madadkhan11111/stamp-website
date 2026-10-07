window.OSD_TOOL_GUIDES = {
    'add-text-pdf.html': {
        title: 'How Add Text to PDF works',
        lead: 'Use this page when a PDF needs a short typed line — an approval, a date, a name, or a note — and you do not want to print it or send the file to a website. Everything runs in this browser tab. The PDF is not uploaded.',
        steps: [
            'Drop a PDF (up to 10MB). The first page opens in the preview.',
            'Type the line you want, choose size and color, then click once on the page to place it.',
            'Drag the red box, or use the arrow buttons / keyboard arrows, until the text sits where it should. Extra clicks do not keep adding copies.',
            'Click Add another only when you need a second line. Download when the page looks right.'
        ],
        notes: 'This tool is for a few typed labels, not for rewriting a whole contract. Scanned handwriting will not become editable text. If the PDF font cannot draw a character, use plain English letters and numbers. Files stay on your device; closing the tab clears the working copy.',
        faqs: [
            { q: 'Why did every click used to add more text?', a: 'The old flow treated each click as a new stamp. It now places one line, then lets you move that line. Use Add another when you truly want a second box.' },
            { q: 'Can I move text after I place it?', a: 'Yes. Select the box (a dashed outline appears), then drag it or tap the arrow buttons. Shift plus an arrow key moves it farther.' },
            { q: 'Does the text become part of the PDF?', a: 'Yes. Download writes the line into the PDF page. Recipients do not need this website to see it.' }
        ]
    },
    'fill-pdf.html': {
        title: 'Filling a PDF form without uploading it',
        lead: 'Fill PDF Form is for files that already contain real form fields — job applications, HR packs, tax worksheets, school forms. You type into those fields in the browser. The filled file is saved on your computer.',
        steps: [
            'Open a PDF that was created as a fillable form, not a photo of a paper form.',
            'Click a field and type. Use Tab to move between fields when the form supports it.',
            'Download the filled PDF. Keep a copy if you need to submit it later.'
        ],
        notes: 'A scanned paper form has no fields. For those, use Add Text to PDF and type on top of the page. We cannot see what you type; the work never leaves this tab.',
        faqs: [
            { q: 'The form will not let me type. Why?', a: 'The PDF is probably a scan or a flattened printout. Use Add Text to PDF instead of this tool.' },
            { q: 'Are my answers stored on your servers?', a: 'No. The form data lives in your browser memory until you download or close the page.' },
            { q: 'Can I fill government PDFs?', a: 'If the agency published a fillable PDF, yes. Always follow that agency’s own filing rules after you download.' }
        ]
    },
    'watermark-pdf.html': {
        title: 'When to watermark a PDF',
        lead: 'A watermark marks a file as draft, confidential, or sample so a later reader can see the status at a glance. This page draws the mark on each page in your browser.',
        steps: [
            'Drop the PDF you want to mark.',
            'Enter the watermark wording (for example Confidential or Draft) and adjust size, rotation, and opacity so it is visible but does not hide the text.',
            'Preview a page, then download. The mark is written into the pages.'
        ],
        notes: 'A light diagonal watermark is meant as a label, not as strong encryption. Anyone can still copy the underlying text. For hiding secrets, use Redact PDF instead of a watermark.',
        faqs: [
            { q: 'Will people be able to remove the watermark?', a: 'A determined editor can try. Treat watermarking as a visible warning, not a lock.' },
            { q: 'Can I watermark only some pages?', a: 'This tool applies the same mark across the document so the status is consistent.' },
            { q: 'Does the file leave my PC?', a: 'No. Rendering and saving happen locally.' }
        ]
    },
    'sign-pdf.html': {
        title: 'Signing a PDF on this site',
        lead: 'Sign PDF is for a simple visual signature on a page you already agree to — an approval, a delivery note, a consent sheet. It is not a qualified electronic signature under every country’s law.',
        steps: [
            'Open the PDF and go to the page that needs a signature.',
            'Draw with a mouse or finger, or type a name-style signature.',
            'Place it, check the preview, and download the signed file.'
        ],
        notes: 'If a bank, court, or government office requires a specific e-sign product, use the product they name. This tool stores nothing; keep your own copy of the signed PDF.',
        faqs: [
            { q: 'Is this legally the same as a wet-ink signature?', a: 'That depends on the document and your local law. This site only draws a signature image into the PDF.' },
            { q: 'Can someone else reuse my drawn signature?', a: 'Only if they have the downloaded file. We do not keep a signature library.' },
            { q: 'What if I sign the wrong page?', a: 'Use undo or start again before you download. After download, the signature is part of that file.' }
        ]
    },
    'date-stamp.html': {
        title: 'Date stamps for records you keep locally',
        lead: 'Date Stamp puts today’s date, or a date you choose, onto a PDF page the way an office date-received stamp would. Useful for packets you archive on your own drive.',
        steps: [
            'Choose the PDF and the page.',
            'Pick the date text and style, then place the stamp.',
            'Download and store the file with your own records.'
        ],
        notes: 'The stamp shows a date you selected. It is not a third-party timestamp authority and does not prove when a file was created on the internet.',
        faqs: [
            { q: 'Does the date update by itself later?', a: 'No. The downloaded PDF keeps the date you placed.' },
            { q: 'Can I back-date a document?', a: 'You can type any date. Do not use that to mislead anyone; you are responsible for how you use the file.' },
            { q: 'Is the PDF uploaded?', a: 'No.' }
        ]
    },
    'merge-pdf.html': {
        title: 'Merging PDFs on your computer',
        lead: 'Merge PDF joins several PDFs into one file in the order you choose. Typical uses: combining signed pages, appending an ID scan to an application, or packing a week of invoices.',
        steps: [
            'Add two or more PDFs. Drag the list to set the page order.',
            'Wait for the preview of the combined stack.',
            'Download the single PDF. Originals on your disk are not deleted.'
        ],
        notes: 'Very large stacks can hit the 10MB-per-file limit or your device memory. Merge in smaller batches if the tab slows down. Encrypted PDFs that need a password cannot be merged here.',
        faqs: [
            { q: 'Will bookmarks and forms survive?', a: 'Page content is kept. Some interactive features from the originals may be simplified in the new file.' },
            { q: 'Can I merge a PDF with images?', a: 'Convert images with Image to PDF or JPG to PDF first, then merge those PDFs.' },
            { q: 'Do you keep the combined file?', a: 'No. Download it if you need it later.' }
        ]
    },
    'split-pdf.html': {
        title: 'Splitting a PDF into a shorter file',
        lead: 'Split PDF is for taking a range of pages out of a longer document — one chapter, one appendix, or the pages a colleague actually needs.',
        steps: [
            'Open the PDF and check the page count.',
            'Enter the page range you want to keep.',
            'Download the new, shorter PDF.'
        ],
        notes: 'If you need every page as its own file, use PDF to Single Pages instead. Split does not email anyone the extra pages; they never leave this tab.',
        faqs: [
            { q: 'Are the leftover pages deleted from the original on disk?', a: 'No. Split writes a new file. Your original stays as it was.' },
            { q: 'Can I split password-protected PDFs?', a: 'Not here. Unlock the file with the owner’s permission first.' },
            { q: 'What is the size limit?', a: '10MB per PDF on this site.' }
        ]
    },
    'split-pdf-pages.html': {
        title: 'One PDF per page, packed in a ZIP',
        lead: 'PDF to Single Pages exports every page as its own PDF and downloads them together as a ZIP. Use it when a printer, a portal, or a colleague asks for “page 3 only” as a file.',
        steps: [
            'Drop the multi-page PDF.',
            'Wait while each page is written to its own PDF.',
            'Download the ZIP and open the page you need.'
        ],
        notes: 'A 40-page file becomes 40 small PDFs. That is intentional. For a single range in one file, use Split PDF instead.',
        faqs: [
            { q: 'Why a ZIP?', a: 'Browsers download one file more reliably than dozens of separate PDFs at once.' },
            { q: 'Do the page PDFs keep the original size?', a: 'Each file is one page at the original page size.' },
            { q: 'Is this processed on a server?', a: 'No. The ZIP is built in your browser.' }
        ]
    },
    'compress-pdf.html': {
        title: 'Compressing a PDF that is too large to email',
        lead: 'Compress PDF shrinks a file so it is more likely to fit an email cap or an upload form. It works in the browser by rebuilding pages at a smaller footprint.',
        steps: [
            'Drop the heavy PDF (max 10MB to start).',
            'Choose a stronger or lighter squeeze and preview the result.',
            'Download the smaller file and check that photos are still readable.'
        ],
        notes: 'Photos and scans shrink more than a text-only report. If a page must stay print-sharp, keep a full-size original. Compression is not encryption.',
        faqs: [
            { q: 'Will the text go blurry?', a: 'Text that is real PDF text usually stays sharp. Photographed pages can look softer.' },
            { q: 'Can I compress below a school portal’s 2MB cap?', a: 'Often yes for scans. If it is still large, crop extra pages or compress images first.' },
            { q: 'Do you store the compressed PDF?', a: 'No.' }
        ]
    },
    'delete-pdf-pages.html': {
        title: 'Removing pages you should not share',
        lead: 'Delete Pages drops the pages you mark, then downloads a PDF without them. Use it before you send a pack that still contains a spare ID scan or an internal appendix.',
        steps: [
            'Open the PDF and review the page list.',
            'Select the pages to remove.',
            'Download the trimmed file. Keep the original if you still need those pages.'
        ],
        notes: 'Deleting a page from the download does not erase backups elsewhere on your computer. For hiding a line on a page you must keep, use Redact PDF.',
        faqs: [
            { q: 'Can I un-delete after download?', a: 'Only if you still have the original PDF.' },
            { q: 'Does this change the file on disk automatically?', a: 'No. You choose where to save the new file.' },
            { q: 'Is there an upload?', a: 'No.' }
        ]
    },
    'organize-pdf.html': {
        title: 'Reordering PDF pages before you send them',
        lead: 'Organize PDF is a page sorter: move, rotate in the list, and get a file that reads in the order you want — cover first, exhibits last, rotated scans turned upright.',
        steps: [
            'Drop the PDF and wait for page thumbnails.',
            'Drag pages into the order a reader should see.',
            'Download the reordered document.'
        ],
        notes: 'This does not OCR scans or rewrite text. It only changes page order and what you choose to keep in this session.',
        faqs: [
            { q: 'Can I insert a page from another PDF?', a: 'Merge the two PDFs first, then organize the combined file.' },
            { q: 'Will links inside the PDF still jump to the right page?', a: 'Internal links may point to old page numbers. Check important links after you reorder.' },
            { q: 'Private?', a: 'Yes. Sorting happens locally.' }
        ]
    },
    'extract-pdf-text.html': {
        title: 'Copying text out of a PDF',
        lead: 'Extract Text reads text that already exists in the PDF (not a photograph of text) and shows it so you can copy. Handy for quoting a paragraph without retyping.',
        steps: [
            'Open the PDF.',
            'Wait while the text layer is collected.',
            'Copy what you need into your own notes or email.'
        ],
        notes: 'A scanned book page with no text layer will come out empty or as gibberish. This is not an OCR service. We do not keep the extracted text.',
        faqs: [
            { q: 'Why is the output blank?', a: 'The file is likely an image-only scan. You would need OCR software; this site does not provide OCR.' },
            { q: 'Does extract send the PDF to a server?', a: 'No.' },
            { q: 'Can I extract only one page?', a: 'Copy from the shown text after you see it, or split to that page first.' }
        ]
    },
    'crop-pdf.html': {
        title: 'Cropping extra margin off a PDF',
        lead: 'Crop PDF trims the visible page box — useful for scans with black scanner edges or slides with unused border.',
        steps: [
            'Open the PDF and pick a page.',
            'Set the crop rectangle so the content you need remains.',
            'Download and confirm the crop on a couple of pages.'
        ],
        notes: 'Cropping changes what is shown; some PDF viewers still store data outside the crop box. For hiding confidential lines, redact rather than crop.',
        faqs: [
            { q: 'Does crop delete the pixels outside the box?', a: 'Viewers typically show only the crop box. Redact if the leftover data must not exist.' },
            { q: 'Can each page have a different crop?', a: 'Check the tool options on the page; apply carefully on mixed scans.' },
            { q: 'Upload?', a: 'No. Cropping is local.' }
        ]
    },
    'header-footer-pdf.html': {
        title: 'Headers and footers for print-ready PDFs',
        lead: 'Header Footer adds repeating lines — a company name, a disclaimer, a document title — at the top or bottom of pages you already have.',
        steps: [
            'Open the PDF.',
            'Enter header and/or footer text and check a preview page.',
            'Download the labeled file.'
        ],
        notes: 'Keep header text short so it does not cover the real content. For a large diagonal draft mark, Watermark PDF is a better fit.',
        faqs: [
            { q: 'Will this replace an existing header in the file?', a: 'It draws additional text. It does not edit the original layout software’s header.' },
            { q: 'Can I number pages here?', a: 'Use Page Numbers for 1, 2, 3… sequences. Use this tool for words.' },
            { q: 'Local only?', a: 'Yes.' }
        ]
    },
    'page-numbers-pdf.html': {
        title: 'Adding page numbers in the browser',
        lead: 'Page Numbers writes 1, 2, 3 (or a prefix you choose) onto each page so a printed pack stays in order.',
        steps: [
            'Drop the PDF.',
            'Choose position (footer center is the usual choice) and a starting number.',
            'Preview, then download.'
        ],
        notes: 'If the PDF already has numbers from Word or InDesign, you may get two sets. Remove or cover the old ones in the original if that matters.',
        faqs: [
            { q: 'Can I skip numbering the cover?', a: 'Start at page 2 in the original by deleting the cover from a copy, or accept numbers on every page this tool draws.' },
            { q: 'Roman numerals?', a: 'This tool uses ordinary digits.' },
            { q: 'Uploaded?', a: 'No.' }
        ]
    },
    'pdf-to-jpg.html': {
        title: 'Turning PDF pages into JPG photos',
        lead: 'PDF to JPG renders each page as a JPG image. Use it when a website only accepts photos, or when you need a snapshot of a page for a slide.',
        steps: [
            'Open the PDF.',
            'Convert the pages you need.',
            'Download the JPG files (or a ZIP if there are several).'
        ],
        notes: 'A JPG is a picture. People cannot easily copy the original text from it, and you cannot edit the PDF structure in the photo. For a transparent page image, try PDF to PNG.',
        faqs: [
            { q: 'Will the JPG look as sharp as print?', a: 'It is a screen-quality render. For archival print, keep the PDF.' },
            { q: 'Does this upload my PDF?', a: 'No. Pages are drawn in the tab.' },
            { q: 'One page or all pages?', a: 'You can convert the document; multiple pages come as separate images.' }
        ]
    },
    'pdf-to-png.html': {
        title: 'PDF pages as PNG images',
        lead: 'PDF to PNG is the same idea as PDF to JPG, but PNG keeps sharper edges for screenshots, diagrams, and text-heavy pages you will place on a light background.',
        steps: [
            'Drop the PDF.',
            'Render the page or pages to PNG.',
            'Download and insert the PNG where you need it.'
        ],
        notes: 'PNG files are often larger than JPG. If you only need a photo-like page for WhatsApp, JPG is usually enough.',
        faqs: [
            { q: 'Transparent background?', a: 'PDF pages are typically opaque. You get a full-page PNG, not a cut-out logo.' },
            { q: 'Server-side convert?', a: 'No.' },
            { q: 'When should I use JPG instead?', a: 'When file size matters more than crisp line art.' }
        ]
    },
    'image-to-pdf.html': {
        title: 'Building a PDF from mixed photos',
        lead: 'Image to PDF stacks JPG, PNG, or WEBP pictures into a single PDF — receipts, whiteboard shots, or a photo ID plus a form page.',
        steps: [
            'Add the images in the order they should appear.',
            'Optionally pick a page size such as A4 if you want a standard sheet.',
            'Download the PDF.'
        ],
        notes: 'This is the general image stacker. If you only have camera JPGs, JPG to PDF is a shorter path. If you only have PNG screenshots, use PNG to PDF. iPhone HEIC files belong on HEIC to PDF.',
        faqs: [
            { q: 'What size should I pick?', a: 'A4 or Letter if you will print. Otherwise the image’s own size is fine.' },
            { q: 'Max file size?', a: '10MB per file on this site.' },
            { q: 'Do images leave the device?', a: 'No.' }
        ]
    },
    'jpg-to-pdf.html': {
        title: 'JPG to PDF for camera photos',
        lead: 'JPG to PDF is the named path for people who searched exactly that: turn one or more camera JPGs into a PDF they can attach to an application.',
        steps: [
            'Choose JPG files only (this page ignores other types).',
            'Set A4/Letter if the form asks for a standard page, or keep photo size.',
            'Download the PDF and open it once to confirm orientation.'
        ],
        notes: 'If a photo is sideways, rotate the JPG first with Rotate Image. PNG screenshots should use PNG to PDF so you do not flatten them through the wrong picker.',
        faqs: [
            { q: 'Why a separate page from Image to PDF?', a: 'So a JPG-to-PDF search opens a page that only accepts JPGs and explains camera-photo cases.' },
            { q: 'Can I mix PNG here?', a: 'Use Image to PDF or PNG to PDF for PNG files.' },
            { q: 'Upload to a server?', a: 'No.' }
        ]
    },
    'png-to-pdf.html': {
        title: 'PNG screenshots into a PDF',
        lead: 'PNG to PDF is for screenshots, UI captures, and graphics that are already PNG. It keeps a clean page without forcing a JPG recompress first.',
        steps: [
            'Drop PNG files in reading order.',
            'Pick a page fit if you need A4/Letter.',
            'Download and check that nothing is clipped.'
        ],
        notes: 'Photos from a phone are usually JPG or HEIC, not PNG. Use those dedicated pages so the file picker matches what you have.',
        faqs: [
            { q: 'Will transparency stay?', a: 'PDF pages are usually filled; transparent PNG areas may sit on white.' },
            { q: 'Several PNGs, one PDF?', a: 'Yes. Each image becomes a page.' },
            { q: 'Private?', a: 'Yes, local conversion.' }
        ]
    },
    'webp-to-pdf.html': {
        title: 'WEBP screenshots as a PDF',
        lead: 'Some browsers save screenshots as WEBP. WEBP to PDF turns those into a PDF a workplace computer can open without extra codecs.',
        steps: [
            'Add the WEBP files.',
            'Convert to PDF pages.',
            'Download and send the PDF rather than the WEBP if the recipient uses older software.'
        ],
        notes: 'If you only need a JPG for a form that rejects WEBP, use WEBP to JPG instead of making a PDF.',
        faqs: [
            { q: 'My PC cannot open WEBP. Will the PDF work?', a: 'Yes. That is the usual reason to convert.' },
            { q: 'Quality loss?', a: 'A small amount is possible. Keep the WEBP if you need a master copy.' },
            { q: 'Uploaded?', a: 'No.' }
        ]
    },
    'heic-to-pdf.html': {
        title: 'iPhone HEIC photos to PDF',
        lead: 'iPhones often save HEIC. Many office PCs still cannot open it. HEIC to PDF converts those photos into a PDF you can attach to a form.',
        steps: [
            'Add HEIC (or HEIF) photos from your phone.',
            'Wait while the browser decodes them.',
            'Download the PDF.'
        ],
        notes: 'Decoding HEIC is heavier than JPG. If the tab struggles, convert one photo at a time. For a JPG you can edit in older apps, use HEIC to JPG.',
        faqs: [
            { q: 'Why did conversion fail?', a: 'Some HEIC variants need a browser that supports the decoder we use. Try another up-to-date browser, or convert on the iPhone to JPG first.' },
            { q: 'Live Photos?', a: 'Only the still image is used.' },
            { q: 'Do photos go to iCloud through this site?', a: 'No. We never receive the file.' }
        ]
    },
    'heic-to-jpg.html': {
        title: 'HEIC to JPG for apps that reject iPhone photos',
        lead: 'School portals, banks, and Windows PCs often want JPG. HEIC to JPG converts an iPhone photo in the browser so you can upload it where HEIC is blocked.',
        steps: [
            'Drop the HEIC file.',
            'Download the JPG.',
            'Upload that JPG to the form that rejected HEIC.'
        ],
        notes: 'Keep the original HEIC if you still want Apple’s master. The JPG is a compatible copy, not a better original.',
        faqs: [
            { q: 'Does this reduce quality a lot?', a: 'You get a normal JPG. For prints, export from the Photos app at full size if you can.' },
            { q: 'Need a PDF instead?', a: 'Use HEIC to PDF.' },
            { q: 'Server convert?', a: 'No.' }
        ]
    },
    'rotate-pdf.html': {
        title: 'Rotating sideways PDF pages',
        lead: 'Rotate PDF turns pages that were scanned the wrong way — a common issue with phone scans and feeder scanners.',
        steps: [
            'Open the PDF.',
            'Rotate 90° until the text is upright.',
            'Download the corrected file.'
        ],
        notes: 'Rotation changes viewing angle. It does not straighten a skewed photo the way a deskew scanner would.',
        faqs: [
            { q: 'All pages or one page?', a: 'Use the page controls on this page to rotate what you need, then download.' },
            { q: 'Will print still be landscape?', a: 'The PDF page rotation is saved. Print using “auto rotate” in your printer dialog if needed.' },
            { q: 'Local?', a: 'Yes.' }
        ]
    },
    'grayscale-pdf.html': {
        title: 'Making a PDF grayscale',
        lead: 'Grayscale PDF is for when a printer is black-and-white, or when you want a file that does not rely on color to be readable.',
        steps: [
            'Drop the color PDF.',
            'Convert pages to grayscale and preview a photo-heavy page.',
            'Download and print a test page if color meaning matters (charts, stamps).'
        ],
        notes: 'Red vs green in a chart can look the same in gray. Check legends. This is not a color-blindness simulator.',
        faqs: [
            { q: 'Can I undo grayscale later?', a: 'Only from the original color PDF. Keep that original.' },
            { q: 'Does it shrink the file?', a: 'Sometimes. Use Compress PDF if size is the main goal.' },
            { q: 'Uploaded?', a: 'No.' }
        ]
    },
    'reverse-pdf.html': {
        title: 'Reversing page order',
        lead: 'Reverse PDF flips first page to last. People use it when a scanner output a stack backwards or a booklet prints in reverse order.',
        steps: [
            'Open the PDF.',
            'Run reverse and check that page 1 is now the old last page.',
            'Download.'
        ],
        notes: 'This is not the same as mirroring a page (that is Flip PDF). Reverse only changes sequence.',
        faqs: [
            { q: 'Odd number of pages?', a: 'That is fine. Order is simply inverted.' },
            { q: 'Forms and links?', a: 'Page content stays; links may need a check.' },
            { q: 'Private?', a: 'Yes.' }
        ]
    },
    'text-to-pdf.html': {
        title: 'Plain text into a simple PDF',
        lead: 'Text to PDF turns typed notes into a PDF you can attach, without opening a word processor. It is for letters, lists, and short statements.',
        steps: [
            'Paste or type your text.',
            'Preview the pages.',
            'Download the PDF.'
        ],
        notes: 'There is no spelling checker and no advanced layout. For a designed letterhead, use your editor, export PDF, then stamp it here if you need a seal.',
        faqs: [
            { q: 'Fonts and languages?', a: 'Stick to common letters if a character missing in the PDF font. Complex scripts may not embed.' },
            { q: 'Can I add a stamp after?', a: 'Yes. Download, then open Stamp Maker or Add Text.' },
            { q: 'Is text sent to a server?', a: 'No.' }
        ]
    },
    'add-blank-pages.html': {
        title: 'Inserting blank pages',
        lead: 'Blank Pages adds empty sheets — for example a separator before exhibits, or a page someone will sign on paper later.',
        steps: [
            'Open the PDF.',
            'Choose where the blank page should go.',
            'Download the longer file.'
        ],
        notes: 'Blank pages still count toward email size slightly. They are empty, not hidden content.',
        faqs: [
            { q: 'Can I put lined paper?', a: 'This inserts a plain page. You would add lines in another editor.' },
            { q: 'Several blanks?', a: 'Repeat or add more than one as the tool allows.' },
            { q: 'Local?', a: 'Yes.' }
        ]
    },
    'resize-pdf.html': {
        title: 'Resizing PDF pages to A4 or Letter',
        lead: 'Resize PDF fits pages onto a standard sheet so a mixed pack prints without clipping. A4 and Letter are the usual office sizes.',
        steps: [
            'Drop the PDF.',
            'Pick A4 or Letter.',
            'Preview that content is not cut off, then download.'
        ],
        notes: 'Fitting a wide diagram onto A4 can add margin or shrink the drawing. Check a page with tables before you print 40 copies.',
        faqs: [
            { q: 'Is this the same as Compress PDF?', a: 'No. Resize changes page dimensions. Compress tries to shrink file bytes.' },
            { q: 'Legal size to Letter?', a: 'Content is fitted; tiny text may become smaller. Zoom the preview.' },
            { q: 'Upload?', a: 'No.' }
        ]
    },
    'pdf-to-zip.html': {
        title: 'Packing a PDF into a ZIP',
        lead: 'PDF to ZIP wraps the PDF so a mail system that blocks raw PDFs may still accept the attachment, or so you can bundle it with a simple download name.',
        steps: [
            'Choose the PDF.',
            'Download the ZIP.',
            'Send the ZIP only if the recipient knows how to unzip it.'
        ],
        notes: 'A ZIP is not encryption. If the PDF is confidential, protect it by not sending it, or use tools the recipient agreed to. We do not password-lock the ZIP on this page.',
        faqs: [
            { q: 'Why would I ZIP one PDF?', a: 'Some portals and webmail filters treat ZIPs differently from PDFs.' },
            { q: 'Is it smaller?', a: 'A single PDF often barely shrinks. Compress PDF is the size tool.' },
            { q: 'Server?', a: 'No. The ZIP is created locally.' }
        ]
    },
    'remove-pdf-metadata.html': {
        title: 'Stripping PDF metadata before you share',
        lead: 'PDFs can store an author name, software title, and other properties. Remove Metadata writes a copy with those fields cleared so you do not leak an internal username.',
        steps: [
            'Open the PDF.',
            'Run removal and download the cleaned copy.',
            'Open file properties in a PDF reader to confirm the fields you care about are gone.'
        ],
        notes: 'This is not full forensic sanitization. Images can still contain EXIF; hidden attachments may remain. For secrets on the page, redact. For photos, strip EXIF in a photo tool.',
        faqs: [
            { q: 'Does this anonymize the whole file?', a: 'It clears common document properties. It is not a classified-document scrubber.' },
            { q: 'Track changes / comments?', a: 'Review comments in a full PDF editor if the file was heavily annotated.' },
            { q: 'Uploaded?', a: 'No.' }
        ]
    },
    'nup-pdf.html': {
        title: '2-up PDF for printing two pages per sheet',
        lead: '2-Up PDF places two pages side by side on one sheet to save paper on handouts and meeting packs.',
        steps: [
            'Open the PDF.',
            'Create the 2-up layout and preview that text is still readable.',
            'Download and print at actual size, not “fit to page”, if the layout looks right.'
        ],
        notes: 'Dense legal text may become too small on 2-up. Use it for slides and short notes more than for contracts.',
        faqs: [
            { q: '4-up?', a: 'This page is 2-up. For more tiles you would need another layout tool.' },
            { q: 'Booklet folding?', a: '2-up is not imposed for saddle-stitch. It is a simple two-page sheet.' },
            { q: 'Local?', a: 'Yes.' }
        ]
    },
    'flip-pdf.html': {
        title: 'Mirroring PDF pages',
        lead: 'Flip PDF mirrors a page left-right or top-bottom. People use it for iron-on transfers, reverse-print stickers, or a scan that was mirrored.',
        steps: [
            'Drop the PDF.',
            'Choose horizontal or vertical flip.',
            'Download and check a page with a logo so it faces the way you need.'
        ],
        notes: 'Flipping is not rotating. Use Rotate PDF if the page is merely sideways.',
        faqs: [
            { q: 'Will text become unreadable backwards?', a: 'A horizontal flip mirrors letters. That is intended for transfer paper, not for reading on screen.' },
            { q: 'One page only?', a: 'Follow the on-page controls; preview before you download.' },
            { q: 'Upload?', a: 'No.' }
        ]
    },
    'extract-pdf-images.html': {
        title: 'Saving pictures that are already inside a PDF',
        lead: 'Extract Images pulls embedded photos and drawings out as image files so you can reuse a logo or a scan without screenshotting the whole page.',
        steps: [
            'Open the PDF.',
            'Wait while embedded images are listed.',
            'Download the ones you need.'
        ],
        notes: 'A page that is one big scan may yield one large image. Vector logos may not appear as extractable bitmaps. This does not download images from the web; only from the file you opened.',
        faqs: [
            { q: 'No images found?', a: 'The “pictures” may be vectors or a flattened page. Try PDF to PNG for a snapshot of the page instead.' },
            { q: 'Copyright?', a: 'Only extract images you have a right to use.' },
            { q: 'Do you keep the pictures?', a: 'No.' }
        ]
    },
    'scan-to-pdf.html': {
        title: 'Camera photos into a PDF packet',
        lead: 'Scan to PDF uses your camera or existing photos to build a multi-page PDF — a paper letter you photographed, a whiteboard, an ID next to a form.',
        steps: [
            'Allow the camera or pick photos you already took.',
            'Order the pages.',
            'Download the PDF and check that text is readable.'
        ],
        notes: 'This is not a desktop ADF scanner with deskew and blank-page detection. Good lighting and a flat surface help more than any setting on this page. Files stay in the tab.',
        faqs: [
            { q: 'Can I scan both sides of an ID?', a: 'Photograph each side, then include both images as pages.' },
            { q: 'Why is it blurry?', a: 'Hold the phone still, fill the frame, and avoid glare. Retake rather than stretching a bad photo.' },
            { q: 'Uploaded to your server?', a: 'No.' }
        ]
    },
    'redact-pdf.html': {
        title: 'Redacting text you must not share',
        lead: 'Redact PDF paints black boxes over regions you mark so a reader of the download should not see that text. Use it for account numbers, addresses, or names on a page you still need to send.',
        steps: [
            'Open the PDF.',
            'Draw boxes over every sensitive region. Check you did not miss a header or footer.',
            'Download and reopen the file in another viewer to confirm the text is gone from view.'
        ],
        notes: 'Redaction on the web is easy to get wrong (missed duplicates, thumbnails, attachments). For highly sensitive legal files, use dedicated redaction software and a second-person review. We do not receive the document.',
        faqs: [
            { q: 'Is the text still selectable under the box?', a: 'This tool is meant to cover the region in the saved PDF. Always verify in another reader. When in doubt, delete the page instead.' },
            { q: 'Metadata?', a: 'Redaction does not replace Remove Metadata. Run that too if author fields matter.' },
            { q: 'Server-side AI redaction?', a: 'No. You choose the boxes; nothing is sent out.' }
        ]
    },
    'passport-photo.html': {
        title: 'Passport and ID photos in the browser',
        lead: 'Passport Size Photo crops and resizes a portrait toward common ID sizes (including a 35×45 mm style at print resolution and a 2×2 inch option). You still must follow the rules of the country or office that will accept the photo.',
        steps: [
            'Use a recent photo with a plain background and your face clearly visible.',
            'Pick the size the form asks for.',
            'Download and print at 100% scale, or upload the JPG if the form is digital.'
        ],
        notes: 'This site cannot approve a passport photo. UK, US, EU, and many other authorities have extra rules (expression, glasses, crown of head). Read their official guide. We do not store your portrait.',
        faqs: [
            { q: 'Is this an official passport service?', a: 'No. It is a private resizer. The issuing office decides if the photo is valid.' },
            { q: 'What size is 35×45 mm?', a: 'At 300 dpi that is about 413×531 pixels. The tool targets that class of print size.' },
            { q: 'Do you keep faces?', a: 'No. The image never leaves your browser.' }
        ]
    },
    'compress-image.html': {
        title: 'Compressing a photo to a smaller JPG or similar',
        lead: 'Compress Image lowers quality or dimensions so a picture fits an upload box. Use the slider and watch the preview; stop when the file is small enough but still clear.',
        steps: [
            'Drop a JPG, PNG, or WEBP.',
            'Move the quality control until the size looks right.',
            'Download the compressed copy. Keep the original for printing.'
        ],
        notes: 'If a form demands “under 50KB” or “under 20KB”, use Compress to 20KB / 50KB, which targets those caps. This page is the general compressor.',
        faqs: [
            { q: 'Why is a PNG still large?', a: 'PNG is often a poor fit for photos. Convert to JPG, then compress.' },
            { q: 'Repeated compress makes it ugly?', a: 'Always start from the original, not from yesterday’s compressed file.' },
            { q: 'Uploaded?', a: 'No.' }
        ]
    },
    'compress-image-kb.html': {
        title: 'Hitting a 20KB or 50KB photo limit',
        lead: 'Many government and exam portals cap a photo at 20KB or 50KB. This page repeatedly compresses until it is under the cap you pick, or tells you it cannot without destroying the picture.',
        steps: [
            'Choose 20KB or 50KB to match the form.',
            'Drop a portrait or document photo.',
            'Download only if the preview is still recognizable. If not, retake the photo closer and with a plainer background.'
        ],
        notes: 'A huge 12MP photo may never look good at 20KB. Crop to the face first with Crop Image or Passport Size Photo, then compress. We do not upload the portrait.',
        faqs: [
            { q: 'The portal still rejects the file.', a: 'Check width/height pixels, not only kilobytes. Some forms want 200×200 or similar. Resize Image can help after this step.' },
            { q: 'PNG or JPG?', a: 'Portals usually want JPG. Prefer a JPG output.' },
            { q: 'Is 20KB safe for a passport?', a: 'That is a portal cap, not a passport-quality print. Follow the official photo guide for print visas.' }
        ]
    },
    'resize-image.html': {
        title: 'Resizing image pixel dimensions',
        lead: 'Resize Image scales a photo to a maximum width. Use it when a form says “max 1024 pixels wide” or when a huge camera file is slow to email.',
        steps: [
            'Open the image.',
            'Set the max width you need.',
            'Download and confirm the properties in your OS file info.'
        ],
        notes: 'Making a photo larger than the original does not add real detail. For KB limits, use the compress tools after you resize.',
        faqs: [
            { q: 'Keep aspect ratio?', a: 'Yes — the image is not stretched into a different shape by default.' },
            { q: 'Passport size?', a: 'Use Passport Size Photo, which targets ID proportions, not only max width.' },
            { q: 'Local?', a: 'Yes.' }
        ]
    },
    'png-to-jpg.html': {
        title: 'PNG to JPG when a form rejects PNG',
        lead: 'PNG to JPG flattens a PNG (often onto white) into a JPG. Use it for portals that only list JPEG as an accepted type.',
        steps: [
            'Drop the PNG.',
            'Download the JPG.',
            'Upload the JPG to the form.'
        ],
        notes: 'Transparency becomes a solid background. Logos that need a clear background should stay PNG. Photos usually look fine as JPG.',
        faqs: [
            { q: 'Why did a logo get a white box?', a: 'JPG has no transparency. Keep PNG for graphics that need see-through corners.' },
            { q: 'Quality?', a: 'You get a typical JPG. Compress further only if a size cap remains.' },
            { q: 'Upload to you?', a: 'No.' }
        ]
    },
    'jpg-to-png.html': {
        title: 'JPG to PNG',
        lead: 'JPG to PNG wraps a photo as PNG. That does not restore quality lost in the JPG, and the file is often larger. Use it only when a program insists on PNG.',
        steps: [
            'Drop the JPG.',
            'Download the PNG.',
            'Use it in the app that required PNG.'
        ],
        notes: 'This is not “enhancement”. A blocky JPG stays blocky as PNG.',
        faqs: [
            { q: 'Will it become lossless?', a: 'PNG is lossless from this point on, but it cannot invent detail the JPG already dropped.' },
            { q: 'Need a PDF?', a: 'Use JPG to PDF.' },
            { q: 'Private?', a: 'Yes.' }
        ]
    },
    'webp-to-jpg.html': {
        title: 'WEBP to JPG for older software',
        lead: 'Windows tools and some HR sites still fail on WEBP. WEBP to JPG makes a ordinary JPEG copy.',
        steps: [
            'Drop the WEBP.',
            'Download the JPG.',
            'Open it in the older app.'
        ],
        notes: 'Keep the WEBP if you still want the smaller original. Animation in an animated WEBP is not preserved as a moving JPG.',
        faqs: [
            { q: 'Animated WEBP?', a: 'You get a still frame, not a video.' },
            { q: 'PDF instead?', a: 'WEBP to PDF.' },
            { q: 'Server?', a: 'No.' }
        ]
    },
    'image-to-webp.html': {
        title: 'JPG or PNG to WEBP',
        lead: 'Image to WEBP creates a smaller web-friendly picture. Use it when you control the website that will display the file and you know visitors can open WEBP.',
        steps: [
            'Drop a JPG or PNG.',
            'Download the WEBP.',
            'Test it in the browser you care about.'
        ],
        notes: 'Do not send WEBP to a government form that listed JPG only. Convert back with WEBP to JPG if you guessed wrong.',
        faqs: [
            { q: 'Is WEBP always smaller?', a: 'Usually for photos. Not a promise for every PNG graphic.' },
            { q: 'Will Outlook show it?', a: 'Many mail clients still prefer JPG. Know your recipient.' },
            { q: 'Local convert?', a: 'Yes.' }
        ]
    },
    'avif-to-jpg.html': {
        title: 'AVIF to JPG',
        lead: 'Some phones and cameras now export AVIF. AVIF to JPG makes a file almost any computer can open, because AVIF support is still uneven in office software.',
        steps: [
            'Drop the AVIF.',
            'Download the JPG.',
            'Use the JPG in older editors and portals.'
        ],
        notes: 'If conversion fails, your browser may lack an AVIF decoder. Update the browser. We do not run a cloud converter.',
        faqs: [
            { q: 'Why not keep AVIF?', a: 'Keep it as a master if you can. JPG is the compatibility copy.' },
            { q: 'Quality drop?', a: 'Expect a normal JPG, not a larger original.' },
            { q: 'Uploaded?', a: 'No.' }
        ]
    },
    'watermark-image.html': {
        title: 'Watermarking a photo you will post',
        lead: 'Watermark Image draws your name or site on a picture before you share it on social media. It is a visible claim, not a theft-proof lock.',
        steps: [
            'Open the image.',
            'Type the watermark, set opacity, and place it.',
            'Download the marked photo.'
        ],
        notes: 'Anyone can crop a watermark. For confidential documents use Redact PDF on a PDF, not a photo watermark.',
        faqs: [
            { q: 'Can I watermark many photos at once?', a: 'This page is built for the file you open. Repeat for each photo.' },
            { q: 'Does it change EXIF?', a: 'Treat the download as a new picture. Do not assume old camera tags are gone unless you check.' },
            { q: 'Server?', a: 'No.' }
        ]
    },
    'crop-image.html': {
        title: 'Cropping a photo',
        lead: 'Crop Image trims edges — heads cut by extra background, a document with a table in the photo, a screenshot with a desktop border.',
        steps: [
            'Open the image.',
            'Set the crop box.',
            'Download the trimmed picture.'
        ],
        notes: 'Cropping a passport photo is not enough by itself. Use Passport Size Photo if an ID size is required.',
        faqs: [
            { q: 'Can I restore cropped pixels later?', a: 'Only from the original file.' },
            { q: 'Rotate then crop?', a: 'Use Rotate Image first if the photo is sideways.' },
            { q: 'Local?', a: 'Yes.' }
        ]
    },
    'rotate-image.html': {
        title: 'Rotating a sideways photo',
        lead: 'Rotate Image turns a photo 90° at a time. Phones sometimes store a flag that other apps ignore; rotating here writes a straightforward upright picture.',
        steps: [
            'Open the photo.',
            'Rotate until it is upright.',
            'Download and use that copy in the form or PDF tool next.'
        ],
        notes: 'If you need the photo inside a PDF, rotate first, then JPG to PDF — that avoids a sideways page.',
        faqs: [
            { q: 'Flip instead of rotate?', a: 'Use Flip Image to mirror. Rotate to turn.' },
            { q: 'HEIC?', a: 'Convert HEIC to JPG first if this page does not accept HEIC.' },
            { q: 'Upload?', a: 'No.' }
        ]
    },
    'flip-image.html': {
        title: 'Flipping a photo',
        lead: 'Flip Image mirrors a picture horizontally (selfie that feels backwards) or vertically. Use it for mockups and iron-on prints of a graphic.',
        steps: [
            'Open the image.',
            'Flip horizontal or vertical.',
            'Download.'
        ],
        notes: 'Text in the photo will read backwards on a horizontal flip. That is expected.',
        faqs: [
            { q: 'PDF pages?', a: 'Use Flip PDF for a PDF. This page is for pictures.' },
            { q: 'Rotate 180?', a: 'Rotate Image twice, or flip both ways depending on the look you want.' },
            { q: 'Local?', a: 'Yes.' }
        ]
    }
};
