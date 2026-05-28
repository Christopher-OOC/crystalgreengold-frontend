import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Phone, MapPin, ShoppingCart, Award, Loader2 } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { ErrorState } from "@/shared/ui/ErrorState";
import { serviceCenterService } from "@/lib/api/services/service-center.service";
import type { ServiceCenter } from "@/lib/types/service-center.types";

interface ServiceCentersProps {
	onSelectCenter: (centerId: string, centerName: string) => void;
}

export const ServiceCenters: React.FC<ServiceCentersProps> = ({
	onSelectCenter,
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [centers, setCenters] = useState<ServiceCenter[]>([]);

	const fetchServiceCenters = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await serviceCenterService.getAll();
			setCenters(data);
		} catch (err) {
			console.error("Error fetching service centers:", err);
			setError(
				err instanceof Error
					? err.message
					: "Unable to load service centers. Please try again later.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchServiceCenters();
	}, []);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
				<p className="text-emerald-600 font-bold animate-pulse">
					Finding service centers...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Service Centers Error"
				message={error}
				onRetry={fetchServiceCenters}
			/>
		);
	}

	if (centers.length === 0) {
		return (
			<div className="text-center py-16">
				<Award size={48} className="mx-auto text-emerald-200 mb-4" />
				<p className="text-emerald-600 font-medium">
					No service centers available at the moment.
				</p>
				<p className="text-emerald-400 text-sm mt-2">Please check back later.</p>
			</div>
		);
	}

	return (
		<div className="space-y-12 max-w-7xl mx-auto">
			<div className="text-center space-y-4">
				<motion.h2
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-4xl font-bold text-emerald-950 dark:text-white"
				>
					Our <span className="text-amber-400">Service Centers</span>
				</motion.h2>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-emerald-600 font-medium"
				>
					Discover our premium network ready to serve you
				</motion.p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{centers.map((center, i) => (
					<Card
						key={center.serviceCenterId || center.id || center.memberId || i}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.1 }}
						noPadding
						hover
						className="flex flex-col group"
					>
						<div className="relative h-48 overflow-hidden bg-emerald-50 dark:bg-emerald-900">
							{center.profileImageUrl ? (
								<img
									src={center.profileImageUrl}
									alt={center.businessName || center.name}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
									<Award size={48} className="text-amber-400" />
								</div>
							)}
							<div className="absolute top-4 left-4 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-lg">
								<Award size={12} />
								<span className="uppercase tracking-widest">
									Service Center
								</span>
							</div>
						</div>

						<div className="p-6 flex-1 flex flex-col">
							<h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-4 leading-tight">
								{center.businessName || center.name}
							</h3>

							<div className="space-y-3 mb-6 flex-1">
								{center.phoneNumber && (
									<div className="flex items-center space-x-3 text-amber-400">
										<div className="p-1.5 bg-amber-400/10 rounded-lg">
											<Phone size={16} />
										</div>
										<span className="text-sm font-bold">
											{center.phoneNumber}
										</span>
									</div>
								)}
								{center.address && (
									<div className="flex items-start space-x-3 text-emerald-400 dark:text-emerald-600">
										<div className="p-1.5 bg-emerald-50 dark:bg-white/5 rounded-lg shrink-0">
											<MapPin size={16} />
										</div>
										<span className="text-xs font-medium leading-relaxed">
											{center.address}
										</span>
									</div>
								)}
							</div>

							<button
								onClick={() => {
									console.log("Full center object:", center); // log the whole object
									const id = center.memberId || center.serviceCenterId || center.id || "";
									const name = center.businessName || center.name || center.username || "Service Center";

									onSelectCenter(id, name);
								}}
								className="w-full py-3 bg-amber-400 hover:bg-amber-400 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
							>
								<ShoppingCart size={18} />
								<span>Shop at this center</span>
							</button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
