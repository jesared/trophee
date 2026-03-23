"use client";

import * as React from "react";
import { useLoadScript } from "@react-google-maps/api";

import { Input } from "@/components/ui/input";

export type PlaceDetails = {
  name: string;
  formatted_address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export type PlaceValue = {
  value: string;
  place?: PlaceDetails;
};

type PlaceAutocompleteProps = {
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
};

const libraries: ("places")[] = ["places"];

type Prediction = {
  description: string;
  place_id: string;
};

function extractCity(place: google.maps.places.PlaceResult) {
  const components = place.address_components ?? [];
  const cityComponent = components.find((component) =>
    component.types.includes("locality"),
  );
  const fallbackComponent = components.find((component) =>
    component.types.includes("postal_town"),
  );

  return cityComponent?.long_name ?? fallbackComponent?.long_name ?? "";
}

export function PlaceAutocomplete({ value, onChange }: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value.value ?? "");
  const [predictions, setPredictions] = React.useState<Prediction[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const autocompleteServiceRef = React.useRef<
    google.maps.places.AutocompleteService | null
  >(null);
  const placesServiceRef = React.useRef<
    google.maps.places.PlacesService | null
  >(null);
  const debounceRef = React.useRef<number | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  React.useEffect(() => {
    setInputValue(value.value ?? "");
  }, [value.value]);

  React.useEffect(() => {
    if (!isLoaded || autocompleteServiceRef.current) {
      return;
    }

    autocompleteServiceRef.current =
      new google.maps.places.AutocompleteService();
    placesServiceRef.current = new google.maps.places.PlacesService(
      document.createElement("div"),
    );
  }, [isLoaded]);

  React.useEffect(() => {
    if (!open) {
      setPredictions([]);
    }
  }, [open]);

  const fetchPredictions = React.useCallback(
    (nextValue: string) => {
      if (!autocompleteServiceRef.current) {
        return;
      }

      if (!nextValue.trim()) {
        setPredictions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: nextValue,
        },
        (results, status) => {
          setLoading(false);
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !results
          ) {
            setPredictions([]);
            return;
          }
          setPredictions(
            results.map((result) => ({
              description: result.description,
              place_id: result.place_id,
            })),
          );
        },
      );
    },
    [],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    setOpen(true);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      onChange({ value: nextValue });
      fetchPredictions(nextValue);
    }, 300);
  };

  const handleSelect = (prediction: Prediction) => {
    const placesService = placesServiceRef.current;
    if (!placesService) {
      return;
    }

    setInputValue(prediction.description);
    setOpen(false);
    setPredictions([]);

    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "address_components",
        ],
      },
      (place) => {
        if (!place) {
          return;
        }

        const location = place.geometry?.location;
        const details: PlaceDetails = {
          name: place.name ?? prediction.description,
          formatted_address: place.formatted_address ?? prediction.description,
          city: extractCity(place),
          latitude: location ? location.lat() : null,
          longitude: location ? location.lng() : null,
        };

        onChange({ value: prediction.description, place: details });
      },
    );
  };

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Input value={inputValue} onChange={handleInputChange} />
        <p className="text-xs text-destructive">
          Google Maps API key manquante (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-2">
        <Input value={inputValue} onChange={handleInputChange} />
        <p className="text-xs text-destructive">
          Impossible de charger Google Maps. Essayez plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Rechercher un lieu"
      />
      {open && (predictions.length > 0 || loading) ? (
        <div className="absolute z-20 mt-2 w-full surface shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Chargement...
            </div>
          ) : (
            predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(prediction)}
                className="flex w-full items-start px-3 py-2 text-left text-sm transition hover:bg-muted"
              >
                {prediction.description}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
