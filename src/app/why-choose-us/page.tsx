import Link from 'next/link';
import { Button } from '@/components/Button';
import { CheckCircle, Globe, ShieldCheck, Truck, Clock, Users } from 'lucide-react';

export default function WhyChooseUsPage() {
    const features = [
        {
            icon: ShieldCheck,
            title: 'Uncompromising Quality',
            description: 'We source only the finest materials and products, ensuring durability and elegance for your establishment.'
        },
        {
            icon: Globe,
            title: 'Global Sourcing Network',
            description: 'Access a worldwide network of premium suppliers, bringing you the best products from around the globe.'
        },
        {
            icon: Truck,
            title: 'Efficient Logistics',
            description: 'Our streamlined supply chain ensures timely delivery across the Middle East and Africa, minimizing downtime.'
        },
        {
            icon: Users,
            title: 'Dedicated Support',
            description: 'Our team of hospitality experts is always ready to assist you with personalized recommendations and support.'
        },
        {
            icon: CheckCircle,
            title: 'One-Stop Solution',
            description: 'From front-of-house elegance to back-of-house engineering, we cover every aspect of your operational needs.'
        },
        {
            icon: Clock,
            title: 'Timely Execution',
            description: 'We understand the fast-paced nature of hospitality and prioritize quick turnaround times for all orders.'
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-neutral-900 text-white py-20 px-6">
                <div className="container mx-auto text-center max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Why Choose StepVision?
                    </h1>
                    <p className="text-xl text-neutral-300 leading-relaxed">
                        Your trusted partner in Hospitality and Engineering solutions. We combine industry expertise with a vast product range to elevate your business standards.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {features.map((feature, index) => (
                            <div key={index} className="flex flex-col items-start p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="p-3 bg-primary-100 rounded-lg mb-6">
                                    <feature.icon className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary-50 py-20 px-6">
                <div className="container mx-auto text-center max-w-3xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                        Ready to elevate your hospitality standards?
                    </h2>
                    <p className="text-lg text-neutral-600 mb-8">
                        Browse our extensive catalogue or get in touch with our team for a custom quote.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/products">
                            <Button variant="primary" size="lg">
                                Explore Products
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg" className="bg-white hover:bg-neutral-50">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
