// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async req => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}
	const { address } = await req.json();
	const response = await fetch(
		`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(
			address
		)}&benchmark=Public_AR_Current&format=json`,
		{
			method: "GET",
		}
	);
	if (response.ok) {
		const geocodeResponse = await response.json();
		const coordinates =
			geocodeResponse.result.addressMatches[0].coordinates;
		const districtFetch = await fetch(
			`https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${coordinates.x}&y=${coordinates.y}&benchmark=Public_AR_Current&vintage=Current_Current&layers=CD&format=json`,
			{
				method: "GET",
			}
		);
		if (districtFetch.ok) {
			const districtResponse = await districtFetch.json();
			const congressKey = Object.keys(
				districtResponse.result.geographies
			).filter(key => key.includes("Congressional Districts"));
			const district =
				districtResponse.result.geographies[congressKey[0]][0];
			const districtNumber = district.BASENAME.includes("at Large")
				? "0"
				: district.BASENAME;
			const state = districtResponse.result.geographies["States"][0];
			const stateAbbreviation = state.STUSAB;
			const data = { stateAbbreviation, districtNumber };

			return new Response(JSON.stringify(data), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
	}

	return new Response(
		JSON.stringify({
			stateAbbreviation: null,
			districtNumber: null,
			error: "Unable to determine your district. Check your address and try again.",
		}),
		{ headers: { ...corsHeaders, "Content-Type": "application/json" } }
	);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/district-lookup' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
