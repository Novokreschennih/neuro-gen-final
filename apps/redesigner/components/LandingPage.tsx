import React from 'react';
import { useI18n } from '../hooks/useI18n';
import Icon from './Icon';

interface LandingPageProps {
  onEnter: () => void;
}

const FeatureCard: React.FC<{ emoji: string; title: string; children: React.ReactNode; delay: number }> = ({ emoji, title, children, delay }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 animate-fade-in-up" style={{ animationDelay: `${delay}ms`}}>
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white mb-4">
                <span className="text-2xl" role="img" aria-label="feature-icon">{emoji}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{children}</p>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const { t } = useI18n();
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center text-center bg-gray-900 text-white p-6 overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms'}}>
                    <Icon name="logo" className="w-24 h-24 text-indigo-400 mx-auto mb-4" />
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
                        {t('landingPage.title')}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-300">
                        {t('landingPage.subtitle')}
                    </p>
                </div>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard emoji="🎨" title={t('landingPage.feature1.title')} delay={300}>
                        {t('landingPage.feature1.description')}
                    </FeatureCard>
                    <FeatureCard emoji="🪄" title={t('landingPage.feature2.title')} delay={450}>
                        {t('landingPage.feature2.description')}
                    </FeatureCard>
                    <FeatureCard emoji="💬" title={t('landingPage.feature3.title')} delay={600}>
                        {t('landingPage.feature3.description')}
                    </FeatureCard>
                </div>

                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '750ms'}}>
                    <button
                        onClick={onEnter}
                        className="py-4 px-8 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-900 animate-pulse-glow transition-all duration-300 transform hover:scale-105"
                    >
                        {t('landingPage.ctaButton')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;