import React, { useState, useCallback, useRef, useEffect } from "react";

import {
    GoogleMap,
    Marker,
    InfoWindow,
    DirectionsRenderer,
} from "@react-google-maps/api";

import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from "react-places-autocomplete";

const containerStyle = {
    height: "500px",
    width: "650px",
};

const center = {
    lat: 10.7760195,
    lng: 106.6674024,
};

// var directionsService = new window.google.maps.DirectionsService();
// var geocoder = new window.google.maps.Geocoder();
// var service = new window.google.maps.DistanceMatrixService();

function Map() {

    // const [directionsService, setdirectionsService] = useState()
    // const [geocoder, setgeocoder] = useState()
    // const [service, setservice] = useState()

    // useEffect(() => {
    //     setdirectionsService(new window.google.maps.DirectionsService())
    //     setgeocoder(new window.google.maps.Geocoder())
    //     setservice(new window.google.maps.DistanceMatrixService())
    // }, [])

    const [kilo, setKiLo] = useState();
    const [fee, setFee] = useState();
    const [address, setAddress] = useState("");
    const [directions, setDirections] = useState();
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
    const [open, setOpen] = useState(false)
    const [error, setError] = useState('')
    const delaySearchTextTimeOut = useRef(null)

    const mapRef = useRef()

    const onMapLoad = useCallback((map) => {
        mapRef.current = map
    }, [])

    const panTo = useCallback(({ lat, lng }, zoom) => {
        mapRef.current.panTo({ lat, lng })
        mapRef.current.setZoom(zoom);
    }, [])

    const onMapClick = useCallback((event) => {
        setFee();
        setKiLo();
        // setLoadCheckOut(false);
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const latlng = {
            lat: lat,
            lng: lng,
        };
        setCoordinates(latlng);

        new window.google.maps.Geocoder().geocode({ location: latlng }, (results, status) => {
            if (status === "OK") {
                if (results[0]) {
                    setAddress(results[0].formatted_address);
                }
            }
        });
        setDirections();
    });

    const CheckDistance = (coordinates) => {
        if (address === "") {
            setFee()
            setKiLo()
            setDirections()
            panTo({ lat: 10.776028658502982, lng: 106.66740206051449 }, 16)
            return setError("Địa chỉ không được để trống")
        }
        if (!directions) {
            CheckDistanceService(coordinates)
        }

        CheckDistanceMaxtrix(coordinates, address)

    }

    const handleSelect = async (value) => {
        try {
            setAddress(value)
            const result = await geocodeByAddress(value)
            const { lat, lng } = await getLatLng(result[0])
            const destinate = {
                lat: lat,
                lng: lng
            };
            setCoordinates(destinate)
            CheckDistanceService(destinate)
        }
        catch (error) {
            console.log(error)
        }
    };

    const CheckDistanceService = (coordinates) => {
        new window.google.maps.DirectionsService().route(
            {
                origin: center,
                destination: coordinates,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result)
                    panTo(coordinates, 14)
                } else {
                    setFee()
                    setKiLo()
                    panTo({ lat: 10.776028658502982, lng: 106.66740206051449 }, 16)
                    setError("Địa chỉ không phù hợp")
                    setDirections()
                    setAddress("")
                    return;
                }
            }
        );
    }

    const CheckDistanceMaxtrix = (destinate, value) => {
        new window.google.maps.DistanceMatrixService().getDistanceMatrix(
            {
                origins: [center],
                destinations: [destinate],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.IMPERIAL, // miles and feet.
                avoidHighways: false,
                avoidTolls: false
            }, (response, status) => {
                if (status !== "OK") {
                    setError("Error was: " + status)
                } else {
                    const origin = response.originAddresses;
                    if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
                        panTo({ lat: 10.776028658502982, lng: 106.66740206051449 }, 16)
                        setDirections()
                        setError("Địa chỉ không phù hợp")
                        setAddress("")
                    } else {
                        const distance = response.rows[0].elements[0].distance;
                        let distance_in_kilo = distance.value / 1000;
                        console.log(distance_in_kilo)
                        distance_in_kilo = (Math.round(distance_in_kilo * 10) / 10)
                        if (distance_in_kilo > 1800) {
                            panTo({ lat: 10.776028658502982, lng: 106.66740206051449 }, 16)
                            setDirections()
                            setError("Địa chỉ không phù hợp")
                            setAddress("")
                            return
                        }
                        else {
                            if (distance_in_kilo <= 40) {

                                setKiLo(distance_in_kilo)
                                setFee(20000)
                            } else if (distance_in_kilo > 40) {
                                setKiLo(distance_in_kilo)
                                setFee(30000)
                            }
                        }
                    }

                }
            }
        )
    }

    const onChangeAddress = (value) => {
        setFee()
        setKiLo()
        setAddress(value)
        setError("")

        if (delaySearchTextTimeOut.current) {
            clearTimeout(delaySearchTextTimeOut.current)
        }

        delaySearchTextTimeOut.current = setTimeout(async () => {
            const result = await geocodeByAddress(value)
            const { lat, lng } = await getLatLng(result[0])
            const destinate = {
                lat: lat,
                lng: lng
            };
            setCoordinates(destinate)
        }, 300)

    }

    return (
        <div>
            <div>
                <PlacesAutocomplete placeholder="Enter A Location" value={address} onChange={(value) => onChangeAddress(value)} onSelect={handleSelect}>
                    {({ getInputProps, suggestions, getSuggestionItemProps }) =>
                    (
                        <div className="checkout-form-list">
                            <label htmlFor="address">Address</label>
                            <input {...getInputProps({ placeholder: "Enter A Location", id: "to_places", name: "address", className: 'location-search-input' })} />

                            {suggestions.map((suggestion, index) => {
                                return (
                                    <div key={index} {...getSuggestionItemProps(suggestion)}>
                                        <input type="text" name="from"
                                            id="from_places"
                                            disabled
                                            value={suggestion.description} />
                                    </div>
                                );
                            })}
                            <p>{error}</p>
                        </div>
                    )}
                </PlacesAutocomplete>
            </div>
            <div>
                {
                    kilo && fee &&
                    (

                        <div className="col-md-12">
                            <div id="result" className="hide">
                                <div>
                                    <label htmlFor="Kilometers">Kilometers: </label>&nbsp;
                                    <label id="in_kilo">{kilo}km</label>
                                </div>
                                <div>
                                    <label htmlFor="Price">Shipping: </label>&nbsp;
                                    <label id="price_shipping">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(fee) + 'VNĐ'}</label>
                                </div>
                            </div>
                        </div>
                    )
                }

                <div>
                    <div className="order-button-payment">
                        <input value="CHECKING" type="submit" id="distance_form" onClick={() => CheckDistance(coordinates)} />
                    </div>
                </div>
            </div>
            <div>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={16}
                    onClick={onMapClick}
                    onLoad={onMapLoad}
                >
                    <Marker
                        position={{ lat: 10.776028658502982, lng: 106.66740206051449 }}
                        onClick={() => setOpen(true)}
                    >
                        {open && (
                            <InfoWindow onCloseClick={() => setOpen(false)}>
                                <span>Something</span>
                            </InfoWindow>
                        )}
                    </Marker>
                    {coordinates.lat !== null && <Marker position={coordinates} />}
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
            </div>
        </div>
    );
}

export default Map;