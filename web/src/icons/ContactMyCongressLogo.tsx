import { SVGProps } from "react";

export function ContactMyCongressLogo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg width={100} height={100} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<defs>
				<linearGradient id="patriotic">
					<stop offset="40%" stop-color="#dc444b" />
					<stop offset="60%" stop-color="#2b46a0" />
				</linearGradient>
			</defs>
			<circle cx="50" cy="50" r="48" stroke="black" stroke-width="4" fill="url(#patriotic)" />
			<path d="M30 60 H70 V45 L65 40 V35 L50 20 L35 35 V40 L30 45 Z" stroke="black" stroke-width="4" fill="white" />
			<path d="M30 60 L20 75 H80 L70 60" stroke="black" stroke-width="4" fill="white" />
		</svg>
	);
}
