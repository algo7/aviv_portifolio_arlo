// Button for form submission
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send_message')
        .addEventListener('click', function () {
            document.getElementById('contact_form').submit();
        });
});
