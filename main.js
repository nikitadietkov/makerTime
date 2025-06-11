$(document).ready(function () {
    const $noteName = $('#inp-note-name');
    const $noteText = $('#inp-note-text');
    let isInpName = true;
    let isEdit = false;
    let editingNoteId = null;
    let editMode = '';

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
    })

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
                } else if (editMode === 'text') {
                    note.text = $noteText.val();
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
        $('.backgroundNote').show(0, function() {
            $('.backgroundNote').animate({ 'opacity': '1' })
        })
    });

    $(document).on('click', '.backgroundNote', function () {
        $('.backgroundNote').animate({ 'opacity': '0' }, function () {
            $('.backgroundNote').hide(0);
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

    function editNote(updatedNote) {
        let stored = localStorage.getItem('notes');
        let notes = stored ? JSON.parse(stored) : [];

        notes = notes.map(note => {
            if (note.id === updatedNote.id) {
                return updatedNote;
            }
            return note;
        });

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }

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
        notes.forEach(note => renderNote(note));
    }

    function renderNote(note) {
        let noteName = '';
        let noteText = '';
        note.name.length > 15 ? noteName = note.name.slice(0, 15) + '<span class="openNote">...</span>' : noteName = note.name;
        note.text.length > 80 ? noteText = note.text.slice(0, 50) + '<span class="openNote">...</span>' : noteText = note.text;
            
        $('.notes').append(`
            <div class="note-i ${note.archived ? 'archived' : ''}" data-id="${note.id}">
                <h2>${noteName}<button class="editNameBtn"><img src="img/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt=""></button></h2>
                <p class="noteName">${noteText}<button class="editBtn"><img src="img/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt=""></button></p>
                <div class='underNote'>
                    <div class="tools">
                        <button class="arhiveBtn"><img src="img/inbox_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt=""></button>   
                        <button class="deleteBtn"><img src="img/delete_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt=""></button>
                    </div>
                    <p class="date">${note.time} ${note.date}</p>
                </div>
            </div>
        `);
    }
});