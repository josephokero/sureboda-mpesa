import React from 'react';
import { Star, Play, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessStories = () => {
  const testimonials = [
    {
      name: 'Sarah Mitema',
      genre: 'Afro-Pop',
      image: '/api/placeholder/80/80',
  quote: 'KENTUNEZ helped me reach over 100K streams across Africa. The M-Pesa payments make everything so easy!',
      stats: {
        streams: '150K',
        platforms: 8,
        earnings: 'KES 45K'
      }
    },
    {
      name: 'Daniel Kiptoo',
      genre: 'Hip-Hop',
      image: '/api/placeholder/80/80',
      quote: 'From uploading to getting paid, everything is seamless. My music is now on Spotify and Apple Music!',
      stats: {
        streams: '200K',
        platforms: 12,
        earnings: 'KES 68K'
      }
    },
    {
      name: 'Grace Wanjiku',
      genre: 'Gospel',
      image: '/api/placeholder/80/80',
      quote: 'The analytics help me understand my audience better. I can see exactly where my music is being played.',
      stats: {
        streams: '300K',
        platforms: 15,
        earnings: 'KES 92K'
      }
    }
  ];

  const navigate = useNavigate();
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Kenyan Artists
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of Kenyan artists who are already making money from their music 
            and building global audiences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials?.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)]?.map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial?.quote}"
              </blockquote>
              
              {/* Artist Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial?.name}</div>
                  <div className="text-sm text-gray-600">{testimonial?.genre} Artist</div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="font-bold text-gray-900">{testimonial?.stats?.streams}</div>
                  <div className="text-xs text-gray-600">Total Streams</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{testimonial?.stats?.platforms}</div>
                  <div className="text-xs text-gray-600">Platforms</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{testimonial?.stats?.earnings}</div>
                  <div className="text-xs text-gray-600">Earned</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Ready to join these successful artists?</p>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 inline-flex items-center gap-2"
            onClick={() => navigate('/artist-registration')}
          >
            <Play className="w-5 h-5" />
            Start Your Success Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;