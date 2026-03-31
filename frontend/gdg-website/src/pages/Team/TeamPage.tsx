import type React from "react";
import { Navigation } from "../../components/layout/Navigation";
import { Footer } from "../../components/layout/Footer";
import { TeamMemberCard } from "../../components/features/TeamMemberCard";
import FlowingMenu from "../../components/features/FlowingMenu";
import LightPillar from "../../components/features/LightPillar";
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
				{ link: "#", text: "ORGANIZATION TEAM", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E📋%3C/text%3E%3C/svg%3E" }
			],
			bgColor: "transparent",
			textColor: "#ea4335",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#ea4335",
			borderColor: "transparent",
			fontClass: "marquee--font-bebas"
		},
		{
			items: [
				{ link: "#", text: "MARKETING TEAM", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E📱%3C/text%3E%3C/svg%3E" }
			],
			bgColor: "transparent",
			textColor: "#FBBC05",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#FBBC05",
			borderColor: "transparent",
			fontClass: "marquee--font-righteous"
		},
		{
			items: [
				{ link: "#", text: "SPONSORSHIP TEAM", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E💼%3C/text%3E%3C/svg%3E" }
			],
			bgColor: "transparent",
			textColor: "#4285f4",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#4285f4",
			borderColor: "transparent",
			fontClass: "marquee--font-orbitron"
		},
		{
			items: [
				{ link: "#", text: "SOFTWARE TEAM", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E💻%3C/text%3E%3C/svg%3E" }
			],
			bgColor: "transparent",
			textColor: "#34a853",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#34a853",
			borderColor: "transparent",
			fontClass: "marquee--font-bungee"
		}
	];

	return (
		<div className="team-page">
			<Navigation />

			<main className="team-page__content">
				<section className="team-page__leadership">
					<div className="team-page__container">
						<h2>ORGANIZERS</h2>
						<div className="team-page__leadership-grid">
							{leaders.map((member) => (
								<TeamMemberCard key={member.id} member={member} />
							))}
						</div>
					</div>
				</section>

				<section className="team-page__teams">
					<div className="team-page__container">
						<div className="team-page__team-section">
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
							<div className="team-page__team-menu">
								<FlowingMenu {...teamMenus[0]} speed={20} />
							</div>
							<div className="team-page__team-content">
								<div className="team-page__team-leader">
									{organizationTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="team-page__team-members">
									<div className="team-page__team-row team-page__team-row--3">
										{organizationTeam
											.filter((m) => m.role === "member")
											.slice(0, 3)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
									<div className="team-page__team-row team-page__team-row--4">
										{organizationTeam
											.filter((m) => m.role === "member")
											.slice(3, 7)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
								</div>
							</div>
						</div>

						<div className="team-page__team-section">
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
							<div className="team-page__team-menu">
								<FlowingMenu {...teamMenus[1]} speed={20} />
							</div>
							<div className="team-page__team-content">
								<div className="team-page__team-leader">
									{marketingTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="team-page__team-members">
									<div className="team-page__team-row team-page__team-row--3">
										{marketingTeam
											.filter((m) => m.role === "member")
											.slice(0, 2)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
									<div className="team-page__team-row team-page__team-row--4">
										{marketingTeam
											.filter((m) => m.role === "member")
											.slice(2, 5)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
								</div>
							</div>
						</div>

						<div className="team-page__team-section">
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
							<div className="team-page__team-menu">
								<FlowingMenu {...teamMenus[2]} speed={20} />
							</div>
							<div className="team-page__team-content">
								<div className="team-page__team-leader">
									{sponsorshipTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="team-page__team-members">
									<div className="team-page__team-row team-page__team-row--3">
										{sponsorshipTeam
											.filter((m) => m.role === "member")
											.slice(0, 3)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
									<div className="team-page__team-row team-page__team-row--4">
										{sponsorshipTeam
											.filter((m) => m.role === "member")
											.slice(3, 7)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
								</div>
							</div>
						</div>

						<div className="team-page__team-section">
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
							<div className="team-page__team-menu">
								<FlowingMenu {...teamMenus[3]} speed={20} />
							</div>
							<div className="team-page__team-content">
								<div className="team-page__team-leader">
									{softwareTeam
										.filter((m) => m.role === "team-leader")
										.map((member) => (
											<TeamMemberCard key={member.id} member={member} />
										))}
								</div>
								<div className="team-page__team-members">
									<div className="team-page__team-row team-page__team-row--3">
										{softwareTeam
											.filter((m) => m.role === "member")
											.slice(0, 2)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
											))}
									</div>
									<div className="team-page__team-row team-page__team-row--4">
										{softwareTeam
											.filter((m) => m.role === "member")
											.slice(2, 5)
											.map((member) => (
												<TeamMemberCard key={member.id} member={member} />
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
