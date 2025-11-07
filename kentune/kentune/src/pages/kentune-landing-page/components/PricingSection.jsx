// ...existing imports...

const PricingSection = () => {
  const [billingType, setBillingType] = useState('monthly');
  const monthlyPlans = [
    {
      name: 'Starter (Testing the Waters)',
      priceKES: 300,
      highlight: true,
      description: 'Dip your toes into music distribution. Ideal for new artists releasing singles and collaborating with a friend.',
      features: [
        'Distribute unlimited singles',
        'No album or EP releases',
        'Up to 2 artists/collaborators',
        'No stats/analytics',
        '100% earnings',
        'Support response: 1-3 days',
        'Mastering audio available',
      ],
    },
    {
      name: 'Growth',
      priceKES: 400,
      popular: true,
      description: 'Step up your game! Grow your fanbase, collaborate, and get noticed by industry pros. Popular pick for rising stars.',
      features: [
        'Unlimited singles, albums, EPs',
        'Up to 3 artists/collaborators',
        'Basic stats/analytics',
        '100% earnings',
        'Support response: 1-2 days',
        'Mastering audio available',
        'Record deal advantage',
        'Get help directly with our admins (calling support)',
      ],
    },
    {
      name: 'Pro',
      priceKES: 650,
      description: 'Go pro and unlock the full toolkit: advanced stats, instant support, creative guidance, and fast payouts. For serious artists ready to level up.',
      features: [
        'Unlimited singles, albums, EPs',
        'Up to 3 collaborators',
        'Unlimited contributors (lyricist, etc.)',
        'Professional stats and daily stats',
        'Get support whenever you need (including video call support)',
        'Marketing included',
        // PricingSection removed as requested.
            {/* FAQ Section */}
            <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I upgrade my plan anytime?</h4>
                  <p className="text-gray-600 text-sm">Yes, you can upgrade your plan at any time and only pay the difference.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What platforms do you distribute to?</h4>
                  <p className="text-gray-600 text-sm">We distribute to 150+ platforms including Spotify, Apple Music, YouTube Music, Instagram, and more.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Do you take any royalty percentage?</h4>
                  <p className="text-gray-600 text-sm">No hidden fees! You keep 100% of your royalties. We only charge the annual subscription fee.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How do I qualify for Partnership Plan?</h4>
                  <p className="text-gray-600 text-sm">Partnership plans are by invitation only for established artists with significant streaming numbers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
                  <li key={fidx} className="flex items-center mb-2 group">
                    <span className="inline-block w-6 h-6 mr-2 rounded-full bg-black flex items-center justify-center text-[#fdf6ee] text-xl font-bold shadow-md">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full text-center bg-black text-[#fdf6ee] font-bold py-2 px-6 rounded-xl hover:bg-[#fdf6ee] hover:text-black transition-colors shadow text-lg border border-black sticky-purchase-btn"
                // onClick={() => setSelectedPlan(plan)}
              >
                Purchase Plan
              </button>
            </div>
          ))}
        </div>
        

        
        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I upgrade my plan anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, you can upgrade your plan at any time and only pay the difference.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What platforms do you distribute to?</h4>
              <p className="text-gray-600 text-sm">We distribute to 150+ platforms including Spotify, Apple Music, YouTube Music, Instagram, and more.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you take any royalty percentage?</h4>
              <p className="text-gray-600 text-sm">No hidden fees! You keep 100% of your royalties. We only charge the annual subscription fee.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do I qualify for Partnership Plan?</h4>
              <p className="text-gray-600 text-sm">Partnership plans are by invitation only for established artists with significant streaming numbers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;