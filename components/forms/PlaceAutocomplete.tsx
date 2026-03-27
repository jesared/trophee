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

type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

function extractCity(components: AddressComponent[] | null | undefined) {
  const list = components ?? [];
  const cityComponent = list.find((component) =>
    component.types?.includes("locality"),
  );
  const fallbackComponent = list.find((component) =>
    component.types?.includes("postal_town"),
  );

  return (
    cityComponent?.longText ??
    fallbackComponent?.longText ??
    cityComponent?.shortText ??
    fallbackComponent?.shortText ??
    ""
  );
}

export function PlaceAutocomplete({ value, onChange }: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value.value ?? "");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const elementRef = React.useRef<google.maps.places.PlaceAutocompleteElement | null>(
    null,
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    version: "weekly",
    language: "fr",
    region: "FR",
  });

  React.useEffect(() => {
    setInputValue(value.value ?? "");
    if (elementRef.current && value.value) {
      (elementRef.current as unknown as { value?: string }).value = value.value;
    }
  }, [value.value]);

  React.useEffect(() => {
    let placeAutocomplete: google.maps.places.PlaceAutocompleteElement | null =
      null;
    let handleSelect: ((event: Event) => void) | null = null;
    let handleInput: ((event: Event) => void) | null = null;

    if (!isLoaded || !containerRef.current || elementRef.current) {
      return;
    }

    const setup = async () => {
      await google.maps.importLibrary("places");

      placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});
      placeAutocomplete.setAttribute(
        "style",
        "width:100%;display:block;",
      );
      placeAutocomplete.setAttribute("requested-language", "fr");
      placeAutocomplete.setAttribute("requested-region", "FR");
      containerRef.current?.appendChild(placeAutocomplete);
      elementRef.current = placeAutocomplete;

      handleSelect = async (event: Event) => {
        const detail = (event as { placePrediction?: google.maps.places.PlacePrediction })
          .placePrediction;
        if (!detail) return;

        const place = detail.toPlace();
        await place.fetchFields({
          fields: [
            "displayName",
            "formattedAddress",
            "location",
            "addressComponents",
          ],
        });

        const location = place.location;
        const formatted =
          place.formattedAddress ??
          place.displayName ??
          inputValue ??
          "";

        const details: PlaceDetails = {
          name: place.displayName ?? formatted,
          formatted_address: formatted,
          city: extractCity(place.addressComponents as AddressComponent[]),
          latitude: location ? location.lat() : null,
          longitude: location ? location.lng() : null,
        };

        setInputValue(formatted);
        onChange({ value: formatted, place: details });
      };

      handleInput = (event: Event) => {
        const target = event.target as HTMLInputElement | null;
        const nextValue =
          target?.value ?? (placeAutocomplete as unknown as { value?: string }).value ?? "";
        setInputValue(nextValue);
        onChange({ value: nextValue });
      };

      placeAutocomplete.addEventListener("gmp-select", handleSelect);
      placeAutocomplete.addEventListener("input", handleInput);

      if (value.value) {
        (placeAutocomplete as unknown as { value?: string }).value = value.value;
      }
    };

    void setup();

    return () => {
      if (placeAutocomplete) {
        if (handleSelect) {
          placeAutocomplete.removeEventListener("gmp-select", handleSelect);
        }
        if (handleInput) {
          placeAutocomplete.removeEventListener("input", handleInput);
        }
        placeAutocomplete.remove();
      }
      elementRef.current = null;
    };
  }, [isLoaded, onChange]);

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Input value={inputValue} onChange={() => {}} readOnly />
        <p className="text-xs text-destructive">
          Google Maps API key manquante (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
        </p>
      </div>
    );
  }

  if (loadError) {
    const message =
      loadError instanceof Error
        ? loadError.message
        : "Erreur Google Maps.";
    return (
      <div className="space-y-2">
        <Input value={inputValue} onChange={() => {}} readOnly />
        <p className="text-xs text-destructive">
          Impossible de charger Google Maps. {message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-input bg-background px-2 py-2">
        <div ref={containerRef} className="w-full" />
      </div>
      {!inputValue ? (
        <p className="text-xs text-muted-foreground">
          Commencez à taper pour rechercher une salle.
        </p>
      ) : null}
    </div>
  );
}
