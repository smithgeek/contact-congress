export interface Legislator {
	id: Id;
	name: Name;
	bio: Bio;
	terms: Term[];
	leadership_roles?: LeadershipRole[];
	family?: Family[];
}

export interface Id {
	bioguide: string;
	thomas?: string;
	lis?: string;
	govtrack: number;
	opensecrets?: string;
	votesmart?: number;
	fec?: string[];
	cspan?: number;
	wikipedia: string;
	house_history?: number;
	ballotpedia?: string;
	maplight?: number;
	icpsr?: number;
	wikidata: string;
	google_entity_id?: string;
	pictorial?: number;
}

export interface Name {
	first: string;
	last: string;
	official_full: string;
	middle?: string;
	nickname?: string;
	suffix?: string;
}

export interface Bio {
	birthday?: string;
	gender: string;
}

export interface Term {
	type: string;
	start: string;
	end: string;
	state: string;
	district?: number;
	party: string;
	class?: number;
	url?: string;
	address?: string;
	phone?: string;
	fax?: string;
	contact_form?: string;
	office?: string;
	state_rank?: string;
	rss_url?: string;
	caucus?: string;
	how?: string;
	"end-type"?: string;
	party_affiliations?: PartyAffiliation[];
}

export interface PartyAffiliation {
	start: string;
	end: string;
	party: string;
}

export interface LeadershipRole {
	title: string;
	chamber: string;
	start: string;
	end: string;
}

export interface Family {
	name: string;
	relation: string;
}
