$(document).ready(function() {
    // Hide the modal initially
    $('#fileNameModal').hide();
    
    // Event listener for generate audio button
    $('#generateAudioButton').click(function() {
        var text = $('#text_input').val().trim();
        if (!text) {
            displayMessage("Please enter some text.");
            return;
        }

        // Check if the text has already been generated
        $.ajax({
            type: 'POST',
            url: '/check_text',
            contentType: 'application/json',
            data: JSON.stringify({ text: text }),
            success: function(response) {
                if (response.exists) {
                    displayMessage("Audio for this text has already been generated.");
                } else {
                    showModal();
                }
            },
            error: function(error) {
                displayMessage('Error checking text.');
            }
        });
    });

    // Event listener for closing the modal
    $('.close').click(function() {
        closeModal();
    });

    // Close the modal if the user clicks outside of it
    $(window).click(function(event) {
        if ($(event.target).hasClass('modal')) {
            closeModal();
        }
    });

    // Initial load of audios
    listAudios();
});

// Show the modal for entering file name
function showModal() {
    $('#fileNameModal').show();
}

// Close the modal
function closeModal() {
    $('#fileNameModal').hide();
}

// Function to generate audio
function generateAudio() {
    var text = $('#text_input').val().trim();
    var file_name = $('#file_name_input').val().trim();

    if (!file_name) {
        displayMessage("Please enter a file name.");
        return;
    }

    // Disable button during request
    $('button').prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: '/generate_audio',
        contentType: 'application/json',
        data: JSON.stringify({ text: text, file_name: file_name }),
        success: function(response) {
            if (response.success) {
                displayMessage(response.message);
                listAudios();
                $('#text_input').val(''); // Clear input after successful generation
                $('#file_name_input').val(''); // Clear file name input
                closeModal(); // Close the modal
            } else {
                displayMessage(response.message);
            }
        },
        error: function(error) {
            displayMessage('Error generating audio.');
        },
        complete: function() {
            $('button').prop('disabled', false); // Enable button after request completes
        }
    });
}

// Function to list generated audios
function listAudios() {
    $.ajax({
        type: 'GET',
        url: '/list_audios',
        success: function(response) {
            $('#audio_list_items').empty();
            response.audios.forEach(function(audio) {
                $('#audio_list_items').append(`<li>${audio.file_name} 
                    <button onclick="playAudio('${audio.file_name}')">Play</button>
                    <button onclick="deleteAudio('${audio.file_name}')">Delete</button>
                </li>`);
            });
        },
        error: function(error) {
            displayMessage('Error listing audios.');
        }
    });
}

// Function to play audio
function playAudio(file_name) {
    var audioElement = new Audio(`/uploads/audio/${file_name}`);
    audioElement.play().catch(function(error) {
        displayMessage('Error playing audio: ' + error.message);
    });
}

// Function to delete audio
function deleteAudio(file_name) {
    $.ajax({
        type: 'DELETE',
        url: `/delete_audio/${file_name}`,
        success: function(response) {
            displayMessage(response.message);
            listAudios(); // Refresh the list of audios
        },
        error: function(error) {
            displayMessage('Error deleting audio.');
        }
    });
}

// Function to display message and auto-hide after 5 seconds
function displayMessage(message) {
    $('#message').text(message).fadeIn();
    setTimeout(function() {
        $('#message').fadeOut();
    }, 5000); // 5 seconds
}
