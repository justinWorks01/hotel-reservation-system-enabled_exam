function escapeHtml(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCourseOptions(selectedId) {
  let html = '<option value="">Select a course</option>';

  Database.getAll("courses").forEach(function (course) {
    const selected = (course.course_id === selectedId) ? " selected" : "";
    html += '<option value="' + course.course_id + '"' + selected + '>' +
              escapeHtml(course.course_name) +
            '</option>';
  });

  return html;
}

function getCourseName(courseId) {
  if (!courseId) return "-";
  const course = Database.getById("courses", courseId);
  return course ? course.course_name : "-";
}

function showCoursesPage(message, editId) {
  const editing = editId ? Database.getById("courses", editId) : null;
  const courses = Database.getAll("courses");

  let html =
    '<div class="panel">' +
      '<h2>' + (editing ? "Edit Course" : "Add Course") + '</h2>' +
      '<div class="form-grid">' +
        '<div class="form-group">' +
          '<label for="course-name">Course Name</label>' +
          '<input type="text" id="course-name" placeholder="e.g. BSIT" value="' + (editing ? escapeHtml(editing.course_name) : "") + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="course-desc">Description</label>' +
          '<input type="text" id="course-desc" placeholder="Optional" value="' + (editing ? escapeHtml(editing.description) : "") + '">' +
        '</div>' +
      '</div>' +
      '<button class="btn" id="btn-save-course">' + (editing ? "Update Course" : "Add Course") + '</button> ' +
      (editing ? '<button class="btn btn-gray" id="btn-cancel-course">Cancel</button>' : "") +
      '<div id="course-message">' + (message || "") + '</div>' +
    '</div>';

  html +=
    '<div class="panel">' +
      '<h2>View Courses <span class="count">(' + courses.length + ' records)</span></h2>' +
      '<table class="data-table">' +
      '<tr><th>ID</th><th>Course Name</th><th>Description</th><th>Actions</th></tr>';

  if (courses.length === 0) {
    html += '<tr><td colspan="4">No courses yet. Add one using the form above.</td></tr>';
  }

  courses.forEach(function (course) {
    html += '<tr>' +
              '<td>' + course.course_id + '</td>' +
              '<td><span class="course-tag">' + escapeHtml(course.course_name) + '</span></td>' +
              '<td>' + escapeHtml(course.description) + '</td>' +
              '<td>' +
                '<button class="btn btn-small btn-warning btn-edit-course" data-id="' + course.course_id + '">Edit</button> ' +
                '<button class="btn btn-small btn-danger btn-delete-course" data-id="' + course.course_id + '">Delete</button>' +
              '</td>' +
            '</tr>';
  });

  html += '</table></div>';
  contentArea.innerHTML = html;

  document.getElementById("btn-save-course").addEventListener("click", function () {
    const record = {
      course_name: document.getElementById("course-name").value.trim(),
      description: document.getElementById("course-desc").value.trim()
    };

    let result;
    if (editing) {
      result = Database.update("courses", editing.course_id, record);
    } else {
      result = Database.insert("courses", record);
    }

    if (result.ok) {
      showCoursesPage('<p class="msg-ok">Course saved successfully.</p>');
    } else {
     
      document.getElementById("course-message").innerHTML =
        '<p class="msg-error">' + result.errors.join("<br>") + '</p>';
    }
  });

  if (editing) {
    document.getElementById("btn-cancel-course").addEventListener("click", function () {
      showCoursesPage();
    });
  }

  document.querySelectorAll(".btn-edit-course").forEach(function (button) {
    button.addEventListener("click", function () {
      showCoursesPage("", Number(button.dataset.id));
    });
  });

  document.querySelectorAll(".btn-delete-course").forEach(function (button) {
    button.addEventListener("click", function () {
      if (confirm("Delete this course?")) {
        const result = Database.remove("courses", Number(button.dataset.id));
        showCoursesPage(result.ok
          ? '<p class="msg-ok">Course deleted.</p>'
          : '<p class="msg-error">' + result.errors.join("<br>") + '</p>');
      }
    });
  });
}

