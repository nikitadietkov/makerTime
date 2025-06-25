$(document).ready(function () {
    const $noteName = $('#inp-note-name');
    const $noteText = $('#inp-note-text');
    const $noteCat = $('#note-category');
    let isInpName = true;
    let isEdit = false;
    let editingNoteId = null;
    let editMode = '';
    let categoryCheck = '';
    let categoryCounts = [0, 0, 0, 0];

    let nameCategory = ['statistic-important', 'statistic-notImportant', 'statistic-homework', 'statistic-buyList'];




    let importants = 1;
    let notImportants = 1;
    let homeworks = 1;
    let buyLists = 1;


    $('.statistic-important').width(window.innerWidth / importants);
    $('.statistic-notImportant').width(window.innerWidth / notImportants);
    $('.statistic-homework').width(window.innerWidth / homeworks);
    $('.statistic-buyList').width(window.innerWidth / buyLists);


    $('#inp-note-add').show();

    if (localStorage.getItem('notes')) loadNotes();

    $('#inp-note-add').on('click', function () {
        const nowDate = new Date();

        if (isInpName) {
            if ($noteName.val().trim() !== '') {
                isInpName = false;
                $noteName.hide();
                $noteText.show();
                $('.progress-bar').text('50%');
                $('.progress-bar').attr('aria-valuenow', '50');
                $('.progress-bar').css({ width: '50%' });
            } else {
                alert('Напиши заголовок нотатки');
            }
        } else {
            if ($noteText.val().trim() !== '') {
                let note = {
                    id: Date.now(),
                    name: $noteName.val(),
                    text: $noteText.val(),
                    category: $noteCat.val(),
                    date: `${nowDate.getDate()}.${nowDate.getMonth() + 1}`,
                    time: `${nowDate.getHours()}:${nowDate.getMinutes()}`,
                    archived: false
                };

                saveNote(note);
                renderNote(note);

                $noteText.val('');
                $noteName.val('');
                $noteText.hide();
                $noteName.show();
                isInpName = true;
                $('.progress-bar').text('100%');
                $('.progress-bar').attr('aria-valuenow', '100');
                $('.progress-bar').css({ width: '100%' });
            } else {
                alert('Напиши текст до нотатки');
            }
        }
    });
    
    $(document).on('click', '#inp-note-name', function () {
        $('.progress-bar').text('0%');
        $('.progress-bar').attr('aria-valuenow', '0');
        $('.progress-bar').css({ width: '0%' });
    });

    $(document).on('click', '.statistic-important, .statistic-notImportant, .statistic-homework, .statistic-buyList', function () {
        const category = $(this).attr('class').split(' ')[1];
        const isSelected = $(this).css('opacity') == '1';

        $('.statistic-important, .statistic-notImportant, .statistic-homework, .statistic-buyList').css('opacity', '0.5');

        if (!isSelected) {
            $(this).css('opacity', '1');
            categoryCheck = category;
        } else {
            categoryCheck = '';
        }

        renderNotes();
    });


    $('#inp-note-edit').on('click', function () {
        if (!isEdit || editingNoteId === null) {
            alert('Не вибрана нотатка для редагування');
            return;
        }

        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];

        notes = notes.map(note => {
            if (note.id === editingNoteId) {
                if (editMode === 'name') {
                    note.name = $noteName.val();
                    note.category = $noteCat.val();
                } else if (editMode === 'text') {
                    note.text = $noteText.val();
                    note.category = $noteCat.val();
                }
            }
            return note;
        });

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();

        alertify.success(editMode === 'name' ? 'Імʼя нотатки оновлено' : 'Текст нотатки оновлено');

        $noteName.val('');
        $noteText.val('');
        $noteName.show();
        $noteText.hide();
        isInpName = true;
        isEdit = false;
        editingNoteId = null;
        editMode = '';

        $('#inp-note-edit').animate({ opacity: 0 }, 200, function () {
            $('#inp-note-edit').hide(0, function () {
                $('#inp-note-add').show(0, function () {
                    $('#inp-note-add').animate({ opacity: 1 }, 200)
                })
            })
        });
    });

    $(document).on('click', '.editNameBtn', function () {
        $('#inp-note-add').animate({ opacity: 0 }, 200, function () {
            $('#inp-note-add').hide(0, function () {
                $('#inp-note-edit').show(0, function () {
                    $('#inp-note-edit').animate({ opacity: 1 }, 200)
                })
            })
        });

        let $note = $(this).closest('.note-i');
        let id = $note.data('id');

        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        let note = notes.find(n => n.id === id);

        if (note) {
            $noteName.val(note.name).show();
            $noteText.hide();
            isInpName = true;
            isEdit = true;
            editingNoteId = id;
            editMode = 'name';
        }
    });
    

    $(document).on('click', '.editBtn', function () {
        $('#inp-note-add').animate({ opacity: 0 }, 200, function () {
            $('#inp-note-add').hide(0, function () {
                $('#inp-note-edit').show(0, function () {
                    $('#inp-note-edit').animate({ opacity: 1 }, 200)
                })
            })
        });

        let $note = $(this).closest('.note-i');
        let id = $note.data('id');

        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        let note = notes.find(n => n.id === id);

        if (note) {
            $noteText.val(note.text).show();
            $noteName.hide();
            isInpName = false;
            isEdit = true;
            editingNoteId = id;
            editMode = 'text';
        }
    });

    $(document).on('click', '.deleteBtn', function () {
        let removeNote = confirm('Видалити нотатку?');
        if (removeNote) {
            let id = $(this).closest('.note-i').data('id');
            deleteNote(id);
            $(this).closest('.note-i').remove();
        }
    });

    $(document).on('click', '.arhiveBtn', function () {
        let $note = $(this).closest('.note-i');
        let id = $note.data('id');

        toggleArchive(id);
        $note.toggleClass('archived');
        alertify.success($note.hasClass('archived') ? 'Нотатку архівовано' : 'Нотатку відновленно');
    });

    $(document).on('click', '.openNote', function () {
        console.log('clicked');
        
        let $note = $(this).closest('.note-i');
        let id = $note.data('id');

        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        let note = notes.find(n => n.id == id);

        $('.fullNote h2').text(note.name);
        $('.fullNote p').text(note.text);
        $('.fullNote .date').text(note.time + ' ' + note.date)
        $('.fullNote').show(0, function() {
            $('.fullNote').animate({ 'opacity': '1' })
        })
    });

    
    // function smoothInsertText(input, text) {
    //     $(input).val('');
    //     let i = 0;

    //     const interval = setInterval(() => {
    //         $(input).val($(input).val() + text[i]);
    //         i++;

    //         if (i >= text.length) {
    //             clearInterval(interval);
    //         }
    //     }, 100);
    // }

    function saveNote(note) {
        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function loadNotes() {
        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        notes.forEach(note => renderNote(note));
        updateStatistics(notes);
    }

    function deleteNote(id) {
        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        notes = notes.filter(note => note.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function toggleArchive(id) {
        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];
        notes = notes.map(note => {
            if (note.id === id) {
                note.archived = !note.archived;
            }
            return note;
        });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function renderNotes() {
        $('.notes').empty();
        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];

        let filteredNotes = categoryCheck ? notes.filter(note => note.category === categoryCheck) : notes;

        filteredNotes.forEach(note => {
            renderNote(note);
        });

        
        updateStatistics(notes);
    }

    function updateStatistics(notes) {
        categoryCounts = [0, 0, 0, 0];
        console.log(categoryCounts);

        notes.forEach(note => {
            if (note.category == 'statistic-important') categoryCounts[0]++;
            if (note.category == 'statistic-notImportant') categoryCounts[1]++;
            if (note.category == 'statistic-homework') categoryCounts[2]++;
            if (note.category == 'statistic-buyList') categoryCounts[3]++;
        });
        
        const totalNotes = notes.length;
        $('.statistic-important').width(totalNotes ? (categoryCounts.important / totalNotes) * 100 + '%' : '0%');
        $('.statistic-notImportant').width(totalNotes ? (categoryCounts.notImportant / totalNotes) * 100 + '%' : '0%');
        $('.statistic-homework').width(totalNotes ? (categoryCounts.homework / totalNotes) * 100 + '%' : '0%');
        $('.statistic-buyList').width(totalNotes ? (categoryCounts.buyList / totalNotes) * 100 + '%' : '0%');
    }
    

    function renderNote(note) {           
        let noteName = '';
        let noteText = '';
        note.name.length > 15 ? noteName = note.name.slice(0, 15) + '<span class="openNote">...</span>' : noteName = note.name;
        note.text.length > 80 ? noteText = note.text.slice(0, 50) + '<span class="openNote">...</span>' : noteText = note.text;
        

        switch (categoryCheck) {
            case '':
                $('.notes').append(`
                    <div class="note-i ${note.archived ? 'archived' : ''} ${note.category}" data-id="${note.id}">
                        <h2>${noteName}<button class="editNameBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></h2>
                        <p class="noteName">${noteText}<button class="editBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></p>
                        <div class='underNote'>
                            <div class="tools">
                                <button class="arhiveBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-120H640q-30 38-71.5 59T480-240q-47 0-88.5-21T320-320H200v120Zm280-120q38 0 69-22t43-58h168v-360H200v360h168q12 36 43 58t69 22ZM200-200h560-560Z"/></svg></button>   
                                <button class="deleteBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                            </div>
                            <p class="date">${note.time} ${note.date}</p>
                        </div>
                    </div>
                `);
                break;
            case 'statistic-important':
                    $('.notes').append(`
                        <div class="note-i ${note.archived ? 'archived' : ''} ${note.category}" data-id="${note.id}">
                            <h2>${noteName}<button class="editNameBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></h2>
                            <p class="noteName">${noteText}<button class="editBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></p>
                            <div class='underNote'>
                                <div class="tools">
                                    <button class="arhiveBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-120H640q-30 38-71.5 59T480-240q-47 0-88.5-21T320-320H200v120Zm280-120q38 0 69-22t43-58h168v-360H200v360h168q12 36 43 58t69 22ZM200-200h560-560Z"/></svg></button>   
                                    <button class="deleteBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                                </div>
                                <p class="date">${note.time} ${note.date}</p>
                            </div>
                        </div>
                    `);
                break;
            case 'statistic-notImportant':
                    $('.notes').append(`
                        <div class="note-i ${note.archived ? 'archived' : ''} ${note.category}" data-id="${note.id}">
                            <h2>${noteName}<button class="editNameBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></h2>
                            <p class="noteName">${noteText}<button class="editBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></p>
                            <div class='underNote'>
                                <div class="tools">
                                    <button class="arhiveBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-120H640q-30 38-71.5 59T480-240q-47 0-88.5-21T320-320H200v120Zm280-120q38 0 69-22t43-58h168v-360H200v360h168q12 36 43 58t69 22ZM200-200h560-560Z"/></svg></button>   
                                    <button class="deleteBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                                </div>
                                <p class="date">${note.time} ${note.date}</p>
                            </div>
                        </div>
                    `);
                break;
            case 'statistic-homework':
                    $('.notes').append(`
                        <div class="note-i ${note.archived ? 'archived' : ''} ${note.category}" data-id="${note.id}">
                            <h2>${noteName}<button class="editNameBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></h2>
                            <p class="noteName">${noteText}<button class="editBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></p>
                            <div class='underNote'>
                                <div class="tools">
                                    <button class="arhiveBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-120H640q-30 38-71.5 59T480-240q-47 0-88.5-21T320-320H200v120Zm280-120q38 0 69-22t43-58h168v-360H200v360h168q12 36 43 58t69 22ZM200-200h560-560Z"/></svg></button>   
                                    <button class="deleteBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                                </div>
                                <p class="date">${note.time} ${note.date}</p>
                            </div>
                        </div>
                    `);
                break;
            case 'statistic-buyList':
                    $('.notes').append(`
                        <div class="note-i ${note.archived ? 'archived' : ''} ${note.category}" data-id="${note.id}">
                            <h2>${noteName}<button class="editNameBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></h2>
                            <p class="noteName">${noteText}<button class="editBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button></p>
                            <div class='underNote'>
                                <div class="tools">
                                    <button class="arhiveBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-120H640q-30 38-71.5 59T480-240q-47 0-88.5-21T320-320H200v120Zm280-120q38 0 69-22t43-58h168v-360H200v360h168q12 36 43 58t69 22ZM200-200h560-560Z"/></svg></button>   
                                    <button class="deleteBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                                </div>
                                <p class="date">${note.time} ${note.date}</p>
                            </div>
                        </div>
                    `);
                break;

        }

    }
});