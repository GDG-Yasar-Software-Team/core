import type React from "react";
import FlowingMenu from "../../components/features/FlowingMenu";
import LightPillar from "../../components/features/LightPillar";
import { TeamMemberCard } from "../../components/features/TeamMemberCard";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import { teamMembers } from "./team.data";

export const TeamPage: React.FC = () => {
	const leaders = teamMembers.filter((m) => m.role === "leader");
	const organizationTeam = teamMembers.filter((m) => m.team === "organization");
	const marketingTeam = teamMembers.filter((m) => m.team === "marketing");
	const sponsorshipTeam = teamMembers.filter((m) => m.team === "sponsorship");
	const softwareTeam = teamMembers.filter((m) => m.team === "software");

	// Team menu items with matching colors and icons
	const teamMenus = [
		{
			items: [
				{
					link: "#",
					text: "ORGANIZATION TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E📋%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#ea4335",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#ea4335",
			borderColor: "transparent",
			fontClass: "marquee--font-bebas",
		},
		{
			items: [
				{
					link: "#",
					text: "MARKETING TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E📱%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#FBBC05",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#FBBC05",
			borderColor: "transparent",
			fontClass: "marquee--font-righteous",
		},
		{
			items: [
				{
					link: "#",
					text: "SPONSORSHIP TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E💼%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#4285f4",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#4285f4",
			borderColor: "transparent",
			fontClass: "marquee--font-orbitron",
		},
		{
			items: [
				{
					link: "#",
					text: "SOFTWARE TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E💻%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#34a853",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#34a853",
			borderColor: "transparent",
			fontClass: "marquee--font-bungee",
		},
	];

	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />

			<main className="flex-1">
				<section className="py-24 [scroll-snap-align:start] min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] relative">
					<div className="max-w-[1200px] mx-auto px-6">
						<h2 className="text-[3.5rem] font-bold text-white m-0 mb-16 text-center relative z-[1] uppercase tracking-wider">ORGANIZERS</h2>
						<div className="grid grid-cols-2 gap-8 max-w-[800px] -mt-[30px] mx-auto relative z-[1] justify-items-center items-start">
							{leaders.map((member) => (
								<TeamMemberCard key={member.id} member={member} />
							))}
						</div>
					</div>
				</section>

				<section className="p-0 bg-white">
					<div className="max-w-full p-0">
						<div className="mb-0 p-0 rounded-none border-none shadow-none h-screen flex flex-col [scroll-snap-align:start] overflow-hidden transition-[background] duration-[600ms] relative bg-white [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#EA4335_100%)]">
							<LightPillar
								topColor="#EA4335"
								bottomColor="#FF6B6B"
								intensity={3.0}
								rotationSpeed={0.3}
								glowAmount={0.015}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="medium"
							/>
							<div className="h-[120px] flex-shrink-0 pt-[72px] relative z-[2]">
								<FlowingMenu {...teamMenus[0]} speed={20} />
							</div>
							<div className="flex-1 flex flex-col justify-center py-16 px-6 overflow-y-hidden -mt-[10px] relative z-[2]">
								<div className="flex justify-center mb-6 mt-5">
									{organizationTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{organizationTeam
											.filter((m) => m.role === "member")
											.slice(0, 3)
											.map((member) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} />
												</div>
											))}
									</div>
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{organizationTeam
											.filter((m) => m.role === "member")
											.slice(3, 6)
											.map((member) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>

						<div className="mb-0 p-0 rounded-none border-none shadow-none h-screen flex flex-col [scroll-snap-align:start] overflow-hidden transition-[background] duration-[600ms] relative bg-white [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#FBBC05_100%)]">
							<LightPillar
								topColor="#FBBC05"
								bottomColor="#FFD700"
								intensity={3.0}
								rotationSpeed={0.3}
								glowAmount={0.015}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="medium"
							/>
							<div className="h-[120px] flex-shrink-0 pt-[72px] relative z-[2]">
								<FlowingMenu {...teamMenus[1]} speed={20} />
							</div>
							<div className="flex-1 flex flex-col justify-center py-16 px-6 overflow-y-hidden -mt-[10px] relative z-[2]">
								<div className="flex justify-center mb-6 mt-5">
									{marketingTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[950px]">
										{marketingTeam
											.filter((m) => m.role === "member")
											.map((member) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>

						<div className="mb-0 p-0 rounded-none border-none shadow-none h-screen flex flex-col [scroll-snap-align:start] overflow-hidden transition-[background] duration-[600ms] relative bg-white [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#4285F4_100%)]">
							<LightPillar
								topColor="#4285F4"
								bottomColor="#64B5F6"
								intensity={3.0}
								rotationSpeed={0.3}
								glowAmount={0.015}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="medium"
							/>
							<div className="h-[120px] flex-shrink-0 pt-[72px] relative z-[2]">
								<FlowingMenu {...teamMenus[2]} speed={20} />
							</div>
							<div className="flex-1 flex flex-col justify-center py-16 px-6 overflow-y-hidden -mt-[10px] relative z-[2]">
								<div className="flex justify-center mb-6 mt-5">
									{sponsorshipTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{sponsorshipTeam
											.filter((m) => m.role === "member")
											.map((member) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>

						<div className="mb-0 p-0 rounded-none border-none shadow-none h-screen flex flex-col [scroll-snap-align:start] overflow-hidden transition-[background] duration-[600ms] relative bg-white [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#34A853_100%)]">
							<LightPillar
								topColor="#34A853"
								bottomColor="#66BB6A"
								intensity={3.0}
								rotationSpeed={0.3}
								glowAmount={0.015}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="medium"
							/>
							<div className="h-[120px] flex-shrink-0 pt-[72px] relative z-[2]">
								<FlowingMenu {...teamMenus[3]} speed={20} />
							</div>
							<div className="flex-1 flex flex-col justify-center py-16 px-6 overflow-y-hidden -mt-[10px] relative z-[2]">
								<div className="flex justify-center mb-6 mt-5">
									{softwareTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{softwareTeam
											.filter((m) => m.role === "member")
											.slice(0, 3)
											.map((member) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} />
												</div>
											))}
									</div>
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{softwareTeam
											.filter((m) => m.role === "member")
											.slice(3, 5)
											.map((member) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default TeamPage;
