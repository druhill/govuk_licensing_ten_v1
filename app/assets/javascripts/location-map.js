function initMap () {
  if ($('#mock-map-lookup').length) {
    var styledMapType = new google.maps.StyledMapType(
      [
        {
          'featureType': 'poi',
          'stylers': [
            {
              'visibility': 'off'
            }
          ]
        },
        {
          'featureType': 'road',
          'elementType': 'labels.icon',
          'stylers': [
            {
              'visibility': 'off'
            }
          ]
        },
        {
          'featureType': 'transit',
          'stylers': [
            {
              'visibility': 'off'
            }
          ]
        }
      ]
    )
    var mapOptions = {
      center: {lat: 0, lng: 0},
      zoom: 2,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      rotateControl: false,
      scaleControl: false
    }

    var input = document.getElementById('pac-input'),
      latInput = document.getElementById('lat-input'),
      lngInput = document.getElementById('lng-input')

    // Create the autocomplete helper, and associate it with
    // an HTML text input box.
    var options = {
      componentRestrictions: {country: 'gb'}
    }
    var autocomplete = new google.maps.places.Autocomplete(input, options)

    var marker

    $('.map-lookup-step2').hide()
    $('#mock-map-lookup .js-launch-lookup').on('click', function (e) {
      e.preventDefault()
      $('.map-lookup-step1').hide()
      $('.map-lookup-step2').show()

      var map = new google.maps.Map(document.getElementById('map-lookup'),
            mapOptions)

      autocomplete.bindTo('bounds', map)

      map.mapTypes.set('styled_map', styledMapType)
      map.setMapTypeId('styled_map')

      marker && marker.setMap(null)

      var place = autocomplete.getPlace()
      if (!place.geometry) {
        return
      }

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport)
      } else {
        map.setCenter(place.geometry.location)
        map.setZoom(17)
      }

      marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        draggable: true
      })

      latInput.value = place.geometry.location.lat()
      lngInput.value = place.geometry.location.lng()

      google.maps.event.addListener(marker, 'dragend', function (event) {
        var lat = event.latLng.lat()
        var lng = event.latLng.lng()
        latInput.value = lat
        lngInput.value = lng
      })

      var location = $('.map-lookup-step1 input').val()
      $('.map-lookup-step2 .location').html(location)
      return false
    })
    $('.change-location').on('click', function (e) {
      e.preventDefault()
      $('.map-lookup-step2').hide()
      $('.map-lookup-step1').show()
    })
  }
}
