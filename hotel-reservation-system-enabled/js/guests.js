function makeGuestNo() {
  let highest = 0;
  Database.getAll("guests").forEach(function (guest) {
    if (guest.guest_id > highest) highest = guest.guest_id;
  });
  return "G-" + String(highest + 1).padStart(4, "0");
}
function showGuestsPage(message) {
  const guests = Database.getAll("guests");

  let html =
    '<div class="panel">' +
      '<h2>Add Guest</h2>' +
      '<div class="form-grid">' +
        '<div class="form-group">' +
          '<label for="guest-first">First Name</label>' +
          '<input type="text" id="guest-first">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="guest-last">Last Name</label>' +
          '<input type="text" id="guest-last">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="guest-contact">Contact No.</label>' +
          '<input type="text" id="guest-contact">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="guest-email">Email</label>' +
          '<input type="text" id="guest-email">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="guest-course">Course</label>' +
          '<select id="guest-course">' + buildCourseOptions() + '</select>' +
        '</div>' +
      '</div>' +
      '<button class="btn" id="btn-save-guest">Save Guest</button>' +
      '<div id="guest-message">' + (message || "") + '</div>' +
    '</div>';

  html +=
    '<div class="panel">' +
      '<h2>Guest Records <span class="count">(' + guests.length + ' records)</span></h2>' +
      '<table class="data-table">' +
      '<tr><th>ID</th><th>Guest No.</th><th>Name</th><th>Contact</th><th>Course</th><th>Action</th></tr>';

  if (guests.length === 0) {
    html += '<tr><td colspan="6">No guests yet. Add one using the form above.</td></tr>';
  }

  guests.forEach(function (guest) {
    html += '<tr>' +
              '<td>' + guest.guest_id + '</td>' +
              '<td>' + escapeHtml(guest.guest_no) + '</td>' +
              '<td>' + escapeHtml(guest.first_name + " " + guest.last_name) + '</td>' +
              '<td>' + escapeHtml(guest.contact_no) + '</td>' +
              '<td><span class="course-tag">' + escapeHtml(getCourseName(guest.course_id)) + '</span></td>' +
              '<td><button class="btn btn-small btn-danger btn-delete-guest" data-id="' + guest.guest_id + '">Delete</button></td>' +
            '</tr>';
  });

  html += '</table></div>';
  contentArea.innerHTML = html;

  document.getElementById("btn-save-guest").addEventListener("click", function () {
    const courseValue = document.getElementById("guest-course").value;

    const record = {
      guest_no:   makeGuestNo(),
      first_name: document.getElementById("guest-first").value.trim(),
      last_name:  document.getElementById("guest-last").value.trim(),
      contact_no: document.getElementById("guest-contact").value.trim(),
      email:      document.getElementById("guest-email").value.trim()
    };
    if (courseValue !== "") {
      record.course_id = Number(courseValue);
    }

    const result = Database.insert("guests", record);

    if (result.ok) {
      showGuestsPage('<p class="msg-ok">Guest saved successfully.</p>');
    } else {
      document.getElementById("guest-message").innerHTML =
        '<p class="msg-error">' + result.errors.join("<br>") + '</p>';
    }
  });

  document.querySelectorAll(".btn-delete-guest").forEach(function (button) {
    button.addEventListener("click", function () {
      if (confirm("Delete this guest?")) {
        const result = Database.remove("guests", Number(button.dataset.id));
        showGuestsPage(result.ok
          ? '<p class="msg-ok">Guest deleted.</p>'
          : '<p class="msg-error">' + result.errors.join("<br>") + '</p>');
      }
    });
  });
}

