// $(document).ready(function () {
//     myStorage = window.localStorage
//     const $noteName = $('#inp-note-name');
//     const $noteText = $('#inp-note-text');
//     let isInpName = true;
//     let noteBox = {}

//     $('#inp-note-add').on('click', function () {
//         const nowDate = new Date();
        
//         // let noteTextWords = $noteText.val().split(' ');

//         // noteTextWords = noteTextWords.map((word) => {
//         //     if (word.length > 23) {
//         //         let firstPart = word.slice(0, 23);
//         //         let secondPart = word.slice(23);
//         //         return firstPart + '-<br>' + secondPart;
//         //     }
//         //     return word;
//         // });

//         // let textNote = noteTextWords.join(' ');


//         if (isInpName) {
//             if ($noteName.val().trim() !== '') {
//                 isInpName = false;
//                 console.log();
//                 $noteName.hide();
//                 $noteText.show();
//             } else {
//                 alert('write text in NAME note');
//             }
//         } else {
            
//             if ($noteText.val().trim() !== '') {
//                 $('.notes').append(`
//                     <div class="note-i">
//                         <h1>${$noteName.val()}</h1>
//                         <p>${$noteText.val()}</p>
//                         <div class='underNote'>
//                             <button class="arhiveBtn"><img src="img/inbox_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt=""></button>
//                             <p class="date">${nowDate.getHours()}:${nowDate.getMinutes()} ${nowDate.getDate()}.${nowDate.getMonth() + 1}</p>
//                         </div>
//                     </div>`);
//                 $noteText.val('');
//                 $noteName.val('');

//                 $noteText.hide()
//                 $noteName.show()
                
                
                
//                 localStorage.setItem()
//             } else {
//                 alert('write text in note');
//             }
//             isInpName = true;
//             console.log('clicked');
            
//         }
//     });

//     $(document).on('contextmenu', '.note-i', function () {
//         let removeNote = confirm('Do you wanna remove your note?');
//         if (removeNote) {
//             $(this).remove();
//         }
//     });

    

//     $(document).on('click', '.arhiveBtn', function () {
//         if (!$(this).closest('.note-i').hasClass('archived')) {
//             alertify.success("Note was archived");
//             $(this).closest('.note-i').toggleClass('archived');
//             console.log($('this').closest('note-i').hasClass('archived'));
            
//         } else {
//             alertify.success("Note was unarchived");
//             $(this).closest('.note-i').toggleClass('archived')
//             console.log($('this').closest('note-i').hasClass('archived'));
//         }
        
//     });
// });
$(document).ready(function () {
    const $noteName = $('#inp-note-name');
    const $noteText = $('#inp-note-text');
    let isInpName = true;

    loadNotes();

    $('#inp-note-add').on('click', function () {
        const nowDate = new Date();

        if (isInpName) {
            if ($noteName.val().trim() !== '') {
                isInpName = false;
                $noteName.hide();
                $noteText.show();
            } else {
                alert('Напиши заголовок заметки');
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
            } else {
                alert('Напиши текст заметки');
            }
        }
    });


    $(document).on('contextmenu', '.note-i', function (e) {
        e.preventDefault();
        let removeNote = confirm('Удалить заметку?');
        if (removeNote) {
            let id = $(this).data('id');
            deleteNote(id);
            $(this).remove();
        }
    });

    $(document).on('click', '.arhiveBtn', function () {
        let $note = $(this).closest('.note-i');
        let id = $note.data('id');

        toggleArchive(id);
        $note.toggleClass('archived');
        alertify.success($note.hasClass('archived') ? 'Нотатку архівовано' : 'Нотатку відновленно');
    });

    function saveNote(note) {
        let notes = JSON.parse(localStorage.getItem('notes'));
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function loadNotes() {
        let notes = JSON.parse(localStorage.getItem('notes'));
        notes.forEach(note => renderNote(note));
    }

    function deleteNote(id) {
        let notes = JSON.parse(localStorage.getItem('notes'));
        notes = notes.filter(note => note.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function toggleArchive(id) {
        let notes = JSON.parse(localStorage.getItem('notes'));
        notes = notes.map(note => {
            if (note.id === id) {
                note.archived = !note.archived;
            }
            return note;
        });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function renderNote(note) {
        $('.notes').append(`
            <div class="note-i ${note.archived ? 'archived' : ''}" data-id="${note.id}">
                <h1>${note.name}</h1>
                <p>${note.text}</p>
                <div class='underNote'>
                    <button class="arhiveBtn">
                        <img src="img/inbox_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">
                    </button>
                    <p class="date">${note.time} ${note.date}</p>
                </div>
            </div>
        `);
    }
});