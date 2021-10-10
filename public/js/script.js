/* 
	  Matthew Bender
	October 2021
	Hatchways Assessment, front-end script
 */
$(document).ready(function () {
	// this array will hold the student data
	const studentsArr = []
	// on document load, display student info and populate studentsArr array
	$(document).on("load", getStudentData())

	function getStudentData() { // data from xmlhttpreq. in server.js
		$.get("/data", (data, status) => {
			// parse the data to iterate
			let studentData = JSON.parse(data)
			// for each student, output div with img, name and info
			studentData.students.forEach(element => {
				let fullName = element.firstName + " " + element.lastName
				let grades = element.grades
				studentsArr.push(element)
				createStudentDataOutput(element.id, fullName, element.email, element.company, element.skill, average(grades), element.pic, element.grades)
			})
		})
		return studentsArr
	}

	// function to create elements
	function createStudentDataOutput(sID, name, email, company, skill, average, img, grades) {
		// creating necessary elements
		let studentDiv = document.createElement("div"), infoDiv = document.createElement("div"), tagDiv = document.createElement('div') // infodiv holds name, emails, etc
		let sName = document.createElement("h1")
		let sImg = document.createElement("img")
		let sEmail = document.createElement("p")
		let sSkill = document.createElement("p")
		let sAvg = document.createElement("p")
		let sCompany = document.createElement("p")
		let expandBtn = document.createElement('button')
		let tagInput = document.createElement('input') // the text input for students tags

		// setting ID's for each div and class names to necessary elements
		$(studentDiv).attr({ class: "studentDiv", id: 'studentDiv' + sID })
		// adding classes to each <p> tag for styling
		$(sName).addClass("studentName")
		$(sEmail).addClass("studentEmail")
		$(sCompany).addClass("studentCompany")
		$(sSkill).addClass("studentSkill")
		$(sAvg).addClass("studentAvg")
		$(expandBtn).addClass("expandBtn")
		$(tagInput).attr({ type: "text", class: "studentTagInput", id: "tagInput" + sID, placeholder: "Add a tag" })
		$(tagDiv).attr({ class: "studentTagOutput", id: "tagOutput" + sID })

		// populate elements with data
		$(expandBtn).html("+")
		$(sName).html(name.toUpperCase())
		$(sEmail).html("Email: " + email)
		$(sCompany).html("Company: " + company)
		$(sSkill).html("Skill: " + skill)
		$(sAvg).html("Average: " + average)
		sImg.src = img

		// append elements to div, then to body
		$(studentDiv).append(sImg)
		$(studentDiv).append(infoDiv)
		$(studentDiv).append(expandBtn)
		// info div
		$(infoDiv).append(sName)
		$(infoDiv).append(sEmail)
		$(infoDiv).append(sCompany)
		$(infoDiv).append(sSkill)
		$(infoDiv).append(sAvg)
		$(infoDiv).append(tagInput)
		$(infoDiv).append(createGradeList(grades, sID))
		$(infoDiv).append(tagDiv)

		$(".studentDataOutput").append(studentDiv)

		/* EVENT LISTENERS */
		// onclick for the expand button
		$(expandBtn).click(() => {
			$gradesList = $("#gradeList" + sID)
			$gradesList.toggle()
			// changing the button symbol based on list visibility
			if ($gradesList.is(':visible')) {
				$(expandBtn).html('-')
			}
			else {
				$(expandBtn).html('+')
			}
		})

		// enter key event listener for the tag input
		$(tagInput).keypress((event) => {
			let code = event.keyCode ? event.keyCode : event.which
			if (code == '13') {
				$id = $('#tagOutput' + sID)
				$id.append(addTag('#tagInput' + sID))
				$('#tagInput' + sID).val("")
			}
			// stops keypress at document level from being triggered
			event.stopPropagation()
		})

		// event listener for search inputs
		$('.filterInput').keyup(() => {
			prepareFilter()
		})
	}

	function prepareFilter() {
		$nameInput = $('.nameSearchInput').val().toUpperCase()
		$tagInput = $('.tagSearchInput').val().toUpperCase()

		for (let i = 0; i < studentsArr.length; i++) {
			// set variables for id, student name, tagoutputdiv and its children (tags)
			let name = (studentsArr[i].firstName + " " + studentsArr[i].lastName).toUpperCase()
			$id = $('#studentDiv' + studentsArr[i].id)
			$tagOutputDiv = $('#tagOutput' + studentsArr[i].id) // the tag output div
			$tags = $tagOutputDiv.children() // individual tags (passed to filterWithTags)
			if ($nameInput && !$tagInput) { // if searching by name only 
				filterStudents("nameOnly", null, $id, name)
			}
			else if (!$nameInput && $tagInput) { // if searching by tag only
				filterStudents("tagsOnly", $tags, $id, null)
			}
			else if ($nameInput && $tagInput) { // if seraching by tag and name
				filterStudents("both", $tags, $id, name)
			} else { // if both inputs are cleared, show all students
				$id.show()
			}
		}
	}

	// averages grade array for infodiv
	function average(grades) {
		let sum = 0.0
		let count = 0
		grades.forEach(value => {
			sum += Number(value)
			count++
		})
		let avg = sum / count
		return avg + "%"
	}

	// create student grade list
	function createGradeList(g, sId) {
		let gradesList = document.createElement("ul")
		$(gradesList).addClass('gradesList')
		for (let i = 0; i < g.length; i++) {
			gradesList.id = "gradeList" + sId // adding id to target this ul when expanding div
			let li = document.createElement('li')
			$(li).html(g[i] + '%')
			$(gradesList).append(li) // append the li items to the ul
		}
		return gradesList // returns the ul, appended to infodiv when called
	}

	// add tag to students tag output div
	function addTag(id) {
		let span = document.createElement('span')
		$value = $(id).val()
		$(span).append($value)
		$(span).addClass('studentTag')
		return span
	}

	function filterStudents(type, arr, s, name) {
		// takes in type (both, none or tags/names only), filters accordingly
		$nameInput = $('.nameSearchInput').val().toUpperCase()
		$tagInput = $('.tagSearchInput').val().toUpperCase()

		if (type == "nameOnly") { // if only searching names
			if (name.indexOf($nameInput) > -1) {
				$(s).show()
			} else {
				$(s).hide()
			}
		}
		else if (type == "both") { // if checking both
			if ($(s).find('.studentTag').length !== 0) { // if the student has tags
				$.each(arr, (c, e) => {
					// find all strings in tags and students names that match search input
					if (e.textContent.toUpperCase().indexOf($tagInput) > -1 && name.indexOf($nameInput) > -1) {
						$(s).show()
					} else {
						$(s).hide()
					}
				})
			} else {
				$(s).hide()
			}
		}
		else if (type == "tagsOnly") { // if only checking tags
			if ($(s).find('.studentTag').length !== 0) {
				$.each(arr, (c, e) => {
					if (e.textContent.toUpperCase().indexOf($tagInput) > -1) {
						$(s).show()
					} else {
						$(s).hide()
					}
				})
			} else { // if tag 
				$(s).hide()
			}
		}
	}
})