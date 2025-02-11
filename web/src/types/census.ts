export interface CensusGeocodeResponse {
	result: Result;
}

export interface Result {
	input: Input;
	addressMatches: AddressMatch[];
}

export interface Input {
	address: Address;
	benchmark: Benchmark;
}

export interface Address {
	address: string;
}

export interface Benchmark {
	isDefault: boolean;
	benchmarkDescription: string;
	id: string;
	benchmarkName: string;
}

export interface AddressMatch {
	tigerLine: TigerLine;
	coordinates: Coordinates;
	addressComponents: AddressComponents;
	matchedAddress: string;
}

export interface TigerLine {
	side: string;
	tigerLineId: string;
}

export interface Coordinates {
	x: number;
	y: number;
}

export interface AddressComponents {
	zip: string;
	streetName: string;
	preType: string;
	city: string;
	preDirection: string;
	suffixDirection: string;
	fromAddress: string;
	state: string;
	suffixType: string;
	toAddress: string;
	suffixQualifier: string;
	preQualifier: string;
}

export interface CesnsusDistrictResponse {
	result: Result;
}

export interface Result {
	geographies: Record<string, State[] | District[]>;
	input: Input;
}

export function isDistrict(geography: State | District): geography is District {
	return "CDSESSN" in geography;
}

export function isState(geography: State | District): geography is State {
	return "STATENS" in geography;
}

export interface State {
	STATENS: string;
	GEOID: string;
	CENTLAT: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	STUSAB: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	DIVISION: string;
	NAME: string;
	REGION: string;
	OBJECTID: number;
	CENTLON: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
}

export interface Subdivision {
	COUSUB: string;
	GEOID: string;
	CENTLAT: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	CENTLON: string;
	COUSUBCC: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
	COUSUBNS: string;
	COUNTY: string;
}

export interface Place {
	DISP_CLR: number;
	NECTAPCI: string;
	GEOID: string;
	CENTLAT: string;
	AREAWATER: string;
	BASENAME: string;
	STATE: string;
	OID: string;
	LSADC: string;
	PLACE: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	PLACECC: string;
	CENTLON: string;
	CBSAPCI: string;
	AREALAND: string;
	INTPTLON: string;
	PLACENS: string;
	MTFCC: string;
}

export interface County {
	GEOID: string;
	CENTLAT: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	CENTLON: string;
	COUNTYCC: string;
	COUNTYNS: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
	COUNTY: string;
}

export interface N2024StateLegislativeDistrictsUpper {
	GEOID: string;
	CENTLAT: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	OID: string;
	SLDU: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	CENTLON: string;
	LSY: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
	LDTYP: string;
}

export interface N2024StateLegislativeDistrictsLower {
	GEOID: string;
	CENTLAT: string;
	SLDL: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	CENTLON: string;
	LSY: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
	LDTYP: string;
}

export interface Block {
	SUFFIX: string;
	GEOID: string;
	CENTLAT: string;
	BLOCK: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	TRACT: string;
	CENTLON: string;
	BLKGRP: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
	LWBLKTYP: string;
	UR: string;
	COUNTY: string;
}

export interface Tract {
	GEOID: string;
	CENTLAT: string;
	AREAWATER: string;
	STATE: string;
	BASENAME: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	TRACT: string;
	CENTLON: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
	COUNTY: string;
}

export interface District {
	GEOID: string;
	CENTLAT: string;
	CDSESSN: string;
	AREAWATER: string;
	BASENAME: string;
	STATE: string;
	OID: string;
	LSADC: string;
	FUNCSTAT: string;
	INTPTLAT: string;
	NAME: string;
	OBJECTID: number;
	CENTLON: string;
	CD119: string;
	AREALAND: string;
	INTPTLON: string;
	MTFCC: string;
}

export interface Input {
	vintage: Vintage;
	location: Location;
	benchmark: Benchmark;
}

export interface Vintage {
	isDefault: boolean;
	id: string;
	vintageName: string;
	vintageDescription: string;
}

export interface Location {
	x: number;
	y: number;
}

export interface Benchmark {
	isDefault: boolean;
	benchmarkDescription: string;
	id: string;
	benchmarkName: string;
}
