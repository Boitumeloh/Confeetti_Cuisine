$(document).ready(() => {
  $("#modal-button").click(() => {
    $(".modal-body").html(""); // Clear modal content
    
    $.get(`/api/courses`)
      .then((results = {}) => {
        const { data } = results;
        
        if (!data || !data.courses || data.courses.length === 0) {
          $(".modal-body").html("<p>No courses available at the moment.</p>");
          return;
        }

        data.courses.forEach((course) => {
          $(".modal-body").append(`
            <div class="course-item">
              <span class="course-title">${course.title}</span>
              <span class="course-cost">$${course.cost}</span>
              <button 
                class="${course.joined ? "joined-button" : "join-button"} btn btn-info btn-sm" 
                data-id="${course._id}"
              >
                ${course.joined ? "Joined" : "Join"}
              </button>
              <div class="course-description">${course.description}</div>
            </div>
          `);
        });
      })
      .then(() => {
        // Attach event listeners dynamically using delegation
        $(".modal-body").on("click", ".join-button", handleJoinButtonClick);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        $(".modal-body").html("<p>Failed to load courses. Please try again later.</p>");
      });
  });
});

const handleJoinButtonClick = (event) => {
  const $button = $(event.target);
  const courseId = $button.data("id");

  $.get(`/api/courses/${courseId}/join`)
    .then((results = {}) => {
      const { data } = results;
      if (data && data.success) {
        $button
          .text("Joined")
          .addClass("joined-button")
          .removeClass("join-button");
      } else {
        $button.text("Try again");
      }
    })
    .catch((error) => {
      console.error("Error joining course:", error);
      $button.text("Error. Try again.");
    });
};
