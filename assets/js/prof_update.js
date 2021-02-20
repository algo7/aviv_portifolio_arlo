// Pass Swtich Script
function passSwitch() {
    const selection = document.getElementById('resetpass');
    const selectResult = selection.options[selection.selectedIndex].text;
    const a = document.getElementById('passField');
    const b = document.getElementById('passFieldConfirm');
    const c = document.getElementById('fileUpload');
    if (selectResult === 'No') {
        a.style.display = 'none';
        b.style.display = 'none';

    } else {
        a.style.display = '';
        b.style.display = '';

    }
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resetpass')
        .addEventListener('change', passSwitch);
});

// Upload Swtich Script
function uploadSwitch() {
    const selection = document.getElementById('changePic');
    const selectResult = selection.options[selection.selectedIndex].text;
    const a = document.getElementById('fileUpload');
    if (selectResult === 'No') {
        a.style.display = 'none';
    } else {
        a.style.display = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('changePic')
        .addEventListener('change', uploadSwitch);
});