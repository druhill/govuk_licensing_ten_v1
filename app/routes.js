var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/task-list', function (req, res) {
  // Define taks-list items (service's sections) using the following structure
  // {
  //   index: '1',
  //   title: 'Local council',
  //   url: 'local-council', // url of the first page on this section
  //   description: 'Find the council you need to apply to',
  //   values: ['local-council'] // input names mandatory for this section
  // }

  var taskListItems = [
    {
      index: '1',
      title: 'Local council',
      url: 'local-council',
      id: 'local-council',
      description: 'Find the council you need to apply to',
      values: ['local-council']
    },
    {
      index: '2',
      title: 'Previous event details',
      url: 'previous-events',
      id: 'previous-events',
      description: 'Provide details of any events you’ve held in the last year.',
      values: ['previous-licence']
    },
    {
      index: '3',
      title: 'Event details',
      url: 'event-start-date',
      id: 'event-details',
      description: 'Confirm activities, dates and location for this application.',
      // old values, without date-picker
      // values: ['event-start-day', 'event-start-month', 'event-start-year', 'event-start-hour', 'event-start-minute', 'event-duration', 'event-description', 'event-selling-tickets', 'event-postcode', 'event-location']
      // new values, with date-picker
      values: ['event-start-date', 'event-start-hour', 'event-start-minute', 'event-duration', 'event-description', 'event-selling-tickets', 'event-postcode', 'other-location-description']
    },
    {
      index: '4',
      title: 'Applicant details',
      url: 'applicant-details',
      id: 'applicant-details',
      description: 'Supply contact information.',
      values: ['applicant-name', 'contact-method']
    },
    {
      index: '5',
      title: 'Confirm and pay',
      url: 'check-your-answers',
      id: 'check-your-answers',
      description: 'Check your application, agree to the terms and conditions, and pay the £21 fee.',
      values: []
    }
  ]

  // Determine the status for each section
  for (var i = 0; i < taskListItems.length; i++) {
    if (taskListItems[i].values) {
      var completed = false
      var partlyCompleted = false
      taskListItems[i].values.forEach((value, index) => {
        if (req.session.data[value]) {
          partlyCompleted = true
          completed = true
        } else {
          completed = false
        }
      })
      if (completed) {
        taskListItems[i].status = 'completed'
      } else if (partlyCompleted) {
        taskListItems[i].status = 'partly-completed'
      } else if (i === 0 || taskListItems[i - 1].status === 'completed') {
        taskListItems[i].status = 'actionable'
      }
    }
  }

  // Render task-list page
  res.render('task-list', {items: taskListItems})
})

router.get('/start-page', function (req, res) {
  req.session.destroy()
  res.render('start-page')
})

router.get('/event-capacity', function (req, res) {
    // get the answer from the query string
    var eventDuration = req.session.data['event-duration']
    var eventStartDate = req.session.data['event-start-date']
    var array = eventStartDate.split('/')
    var parsedEventStartDate = new Date(array[2] + '/' + array[1] + '/' + array[0])
    var today = new Date()
    var fiveDays = new Date()
    fiveDays.setDate(today.getDate() + 5)
    var tenDays = new Date()
    tenDays.setDate(today.getDate() + 10)
    if (parseInt(eventDuration) > 7) {
        // redirect to the relevant page
        res.redirect('ineligible')
    } else if (parsedEventStartDate < fiveDays) {
        // redirect to the relevant page
        res.redirect('ineligible')
    } else {
        // render the page requested
        res.render('event-capacity')
    }
})

router.get('/licensable-activities', function (req, res) {
    // get the answer from the query string
    var eventCapacity = req.session.data['event-capacity']
    if (parseInt(eventCapacity) > 501) {
        // redirect to the relevant page
        res.redirect('ineligible')
    } else {
        // render the page requested
        res.render('licensable-activities')
    }
})

router.get('/licensable-activity-alcohol', function (req, res) {
    // get the answer from the query string
  var licensableActivities = req.session.data['licensable-activities']
  if (licensableActivities == 'None') { // use == for checkboxes
        // redirect to the relevant page
    res.redirect('no-licence-needed')
  } else if (licensableActivities.indexOf('Alcohol') !== -1) {
        // render the page requested
    res.render('licensable-activity-alcohol')
  } else {
        // redirect to the relevant page
    res.redirect('licensable-activity-members')
  }
})

router.get('/licensable-activity-members', function (req, res) {
    // get the answer from the query string
  var licensableActivities = req.session.data['licensable-activities']
  if (licensableActivities.indexOf('Members') !== -1) {
        // render the page requested
    res.render('licensable-activity-members')
  } else {
        // redirect to the relevant page
    res.redirect('licensable-activity-entertainment')
  }
})

router.get('/licensable-activity-entertainment', function (req, res) {
    // get the answer from the query string
  var licensableActivities = req.session.data['licensable-activities']
  if (licensableActivities.indexOf('Entertainment') !== -1) {
        // render the page requested
    res.render('licensable-activity-entertainment')
  } else {
        // redirect to the relevant page
    res.redirect('licensable-activity-nudity')
  }
})

router.get('/licensable-activity-nudity', function (req, res) {
    // get the answer from the query string
  var licensableActivities = req.session.data['licensable-activities']
  if (licensableActivities.indexOf('Nudity') !== -1) {
        // render the page requested
    res.render('licensable-activity-nudity')
  } else {
        // redirect to the relevant page
    res.redirect('licensable-activity-food')
  }
})

router.get('/licensable-activity-food', function (req, res) {
    // get the answer from the query string
  var licensableActivities = req.session.data['licensable-activities']
  if (licensableActivities.indexOf('Food') !== -1) {
        // render the page requested
    res.render('licensable-activity-food')
  } else {
        // redirect to the relevant page
    res.redirect('event-description')
  }
})

router.get('/ten-required', function (req, res) {
  // get the answer from the query string
  var existingLicence = req.session.data['existing-licence']
  var licenceCover = req.session.data['licence-cover']
  if (existingLicence === 'yes' && licenceCover === 'yes') {
    // redirect to the relevant page
    res.redirect('no-licence-needed')
  } else {
    // render the page requested
    res.render('ten-required')
  }
})

router.get('/previous-event-description', function (req, res) {
  // get the answer from the query string
  var previousLicence = req.session.data['previous-licence']
  if (previousLicence == 'no') { // use == for checkboxes
    // redirect to the relevant page
    res.redirect('task-list#event-details')
  } else {
    // render the page requested
    res.render('previous-event-description')
  }
})

router.get('/event-description', function (req, res) {
  // get the answer from the query string
  var duration = req.session.data['event-duration']

  if (duration === 'over-seven-days') {
    res.redirect('ineligible')
  } else {
    res.render('event-description')
  }
})

router.get('/previous-events-close', function (req, res) {
    // get the answer from the query string
    var personalLicence = req.session.data['personal-licence']
    var previousNotice = req.session.data['previous-notice']
    var previousNoticeStandard = req.session.data['previous-notice-standard-num']
    var previousNoticeLate = req.session.data['previous-notice-late-num']
    var numStandard = previousNotice.indexOf('standard') > -1 ? parseInt(previousNoticeStandard) || 0 : 0
    var numLate = previousNotice.indexOf('late') > -1 ? parseInt(previousNoticeLate) || 0 : 0
    if (personalLicence == 'yes') { // use == for checkboxes
        if (numLate < 11 && numStandard + numLate < 51) {
            // render the page requested
            res.render('previous-events-close')
        } else {
            // redirect to the relevant page
            res.redirect('ineligible')
        }
    } else {
        if (numLate < 3 && numStandard + numLate < 6) {
            // render the page requested
            res.render('previous-events-close')
        } else {
            // redirect to the relevant page
            res.redirect('ineligible')
        }
    }
})

router.get('/applicant-details-name', function (req, res) {
    // get the answer from the query string
    var previousEventsClose = req.session.data['previous-events-close']
    if (previousEventsClose.indexOf('neither') === -1) { // use == for checkboxes
        // redirect to the relevant page
        res.redirect('ineligible')
    } else {
        // render the page requested
        res.render('applicant-details-name')
    }
})

router.get('/agent-details-postcode', function (req, res) {
    // get the answer from the query string
    var applicant = req.session.data['applicant-type']

    if (applicant == 'applicant') {
        res.redirect('contact-details')
    } else {
        res.render('agent-details-postcode')
    }
})

router.get('/timeout', function (req, res) {
  req.session.destroy()
  res.render('timeout')
})

module.exports = router
