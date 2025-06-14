// Mock social data for MVP
export const mockPosts = [
  {
    id: '1',
    user_id: 'justin_medeiros',
    content: 'Just finished an insane snatch session! 💪 The technique is finally clicking and I\'m seeing real improvements in my positioning. Remember - patience and consistency are key in Olympic lifting!',
    media_urls: [require('../assets/images/action shots/justin_snatch.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Snatch',
    tags: ['snatch', 'olympiclifting', 'technique', 'training'],
    is_public: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes_count: 847,
    comments_count: 73,
    shares_count: 42,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'ellie1',
    user_id: 'ellie_turner',
    content: 'Clean technique session! 🏋️‍♀️ Working on that explosive hip drive and smooth transition under the bar. The grind never stops! 💪',
    media_urls: [require('../../assets/images/ellie turner/Ellie-Training-Clean.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Clean',
    tags: ['clean', 'olympiclifting', 'technique', 'training', 'grind'],
    is_public: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    likes_count: 623,
    comments_count: 89,
    shares_count: 31,
    is_liked: true,
    profiles: {
      id: 'ellie_turner',
      first_name: 'Ellie',
      last_name: 'Turner',
      avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg'),
    }
  },
  {
    id: '2',
    user_id: 'justin_medeiros',
    content: 'Back squat day! 🏋️‍♂️ Focus on that deep position and driving through the heels. Every rep counts when you\'re building that foundation strength.',
    media_urls: [require('../assets/images/action shots/justin_squat.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Back Squat',
    tags: ['backsquat', 'strength', 'legday', 'fundamentals'],
    is_public: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes_count: 592,
    comments_count: 67,
    shares_count: 28,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'ellie2',
    user_id: 'ellie_turner',
    content: 'Wodapalooza prep is in full swing! 🏊‍♀️🏃‍♀️ The run-swim combo is brutal but I\'m feeling stronger every day. Can\'t wait to compete again!',
    media_urls: [require('../../assets/images/ellie turner/Ellie Turner Wodapalooza Run swim.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Run-Swim',
    tags: ['wodapalooza', 'runswim', 'competition', 'prep', 'endurance'],
    is_public: true,
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    likes_count: 734,
    comments_count: 95,
    shares_count: 38,
    is_liked: false,
    profiles: {
      id: 'ellie_turner',
      first_name: 'Ellie',
      last_name: 'Turner',
      avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg'),
    }
  },
  {
    id: '3',
    user_id: 'justin_medeiros',
    content: 'Clean & Jerk training session complete! 🔥 The power transfer from the clean to the jerk is everything. Working on that explosive hip drive.',
    media_urls: [require('../assets/images/action shots/justin_clean.webp')],
    media_types: ['image/webp'],
    exercise_name: 'Clean & Jerk',
    tags: ['cleanandjerk', 'power', 'olympiclifting', 'explosion'],
    is_public: true,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    likes_count: 456,
    comments_count: 52,
    shares_count: 19,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'ellie3',
    user_id: 'ellie_turner',
    content: 'Training with the champ! 🏆 Always learning something new when I get to work out with @justin_medeiros. The level of focus and intensity is unmatched! 🔥',
    media_urls: [require('../../assets/images/ellie turner/Ellie-Turner-Justin-Medeiros-822x462.webp')],
    media_types: ['image/webp'],
    exercise_name: null,
    tags: ['training', 'teamwork', 'champion', 'motivation', 'crossfit'],
    is_public: true,
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    likes_count: 1247,
    comments_count: 156,
    shares_count: 67,
    is_liked: true,
    profiles: {
      id: 'ellie_turner',
      first_name: 'Ellie',
      last_name: 'Turner',
      avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg'),
    }
  },
  {
    id: '4',
    user_id: 'justin_medeiros',
    content: 'Strict press work today! 💪 Building that overhead strength one rep at a time. No momentum, just pure strength and stability.',
    media_urls: [require('../assets/images/action shots/justin_press.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Strict Press',
    tags: ['strictpress', 'shoulders', 'strength', 'overhead'],
    is_public: true,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    likes_count: 398,
    comments_count: 41,
    shares_count: 15,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'ellie4',
    user_id: 'ellie_turner',
    content: 'Feeling grateful for this journey! 🙏 Every training session, every challenge, every victory - it all shapes us into who we are meant to become. Keep pushing! 💫',
    media_urls: [require('../../assets/images/ellie turner/ellieturner_960x1200_2.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: null,
    tags: ['motivation', 'journey', 'grateful', 'mindset', 'inspiration'],
    is_public: true,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    likes_count: 892,
    comments_count: 127,
    shares_count: 54,
    is_liked: false,
    profiles: {
      id: 'ellie_turner',
      first_name: 'Ellie',
      last_name: 'Turner',
      avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg'),
    }
  },
  {
    id: '5',
    user_id: 'justin_medeiros',
    content: 'Rope climb practice! 🧗‍♂️ Technique is everything here - efficient movement saves energy for the rest of the workout. Practice those J-hooks!',
    media_urls: [require('../assets/images/action shots/justin_rope_climb.jpeg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Rope Climb',
    tags: ['ropeclimb', 'technique', 'gymnastics', 'efficiency'],
    is_public: true,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    likes_count: 367,
    comments_count: 48,
    shares_count: 12,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'ellie5',
    user_id: 'ellie_turner',
    content: 'Recovery day vibes! 🧘‍♀️ Sometimes the best training is knowing when to rest. Mobility, meditation, and meal prep - the holy trinity of recovery! ✨',
    media_urls: [require('../../assets/images/ellie turner/dbcee15b554c7fffb0419600a4ed8d09.jpeg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Recovery',
    tags: ['recovery', 'mobility', 'meditation', 'mealprep', 'selfcare'],
    is_public: true,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    likes_count: 543,
    comments_count: 78,
    shares_count: 29,
    is_liked: true,
    profiles: {
      id: 'ellie_turner',
      first_name: 'Ellie',
      last_name: 'Turner',
      avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg'),
    }
  },
  {
    id: '6',
    user_id: 'justin_medeiros',
    content: 'Muscle-up progression work! 🤸‍♂️ The transition is the key - smooth from pull to push. Every athlete should master this movement.',
    media_urls: [require('../assets/images/action shots/justin_muscleup.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Muscle-Up',
    tags: ['muscleup', 'gymnastics', 'transition', 'bodyweight'],
    is_public: true,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
    likes_count: 478,
    comments_count: 61,
    shares_count: 23,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: '7',
    user_id: 'justin_medeiros',
    content: 'Mobility work never stops! 🧘‍♂️ Spending time on hip flexors and ankle mobility today. Recovery and maintenance are just as important as training.',
    media_urls: [require('../assets/images/action shots/justin_mobility.jpeg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Mobility Work',
    tags: ['mobility', 'recovery', 'maintenance', 'flexibility'],
    is_public: true,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
    likes_count: 612,
    comments_count: 84,
    shares_count: 37,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: '8',
    user_id: 'justin_medeiros',
    content: 'Running intervals today! 🏃‍♂️ Cardio base is crucial for CrossFit success. Building that engine one lap at a time.',
    media_urls: [require('../assets/images/action shots/justin_run.webp')],
    media_types: ['image/webp'],
    exercise_name: 'Running',
    tags: ['running', 'cardio', 'intervals', 'endurance'],
    is_public: true,
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
    likes_count: 334,
    comments_count: 39,
    shares_count: 14,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  }
];

// Mock YouTube content posts
export const mockYouTubePosts = [
  {
    id: 'yt1',
    user_id: 'justin_medeiros',
    content: 'New video is live! 📹 Ellie and I break down everything about the 2023 CrossFit Games prep. Check out the full video on my channel!',
    media_urls: [require('../assets/images/youtube covers/Justin and Ellie Turn Up About 2023 CrossFit Games.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: null,
    tags: ['youtube', 'games', 'prep', 'video', 'crossfitgames'],
    is_public: true,
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
    likes_count: 1523,
    comments_count: 187,
    shares_count: 94,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'yt2',
    user_id: 'justin_medeiros',
    content: 'Just dropped a new video completing the Open workout! 🔥 Technique breakdown and strategy included. Link in bio!',
    media_urls: [require('../assets/images/youtube covers/Justin Medeiros Completes Open Workout.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: null,
    tags: ['youtube', 'open', 'workout', 'strategy', 'technique'],
    is_public: true,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    likes_count: 967,
    comments_count: 134,
    shares_count: 56,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'yt3',
    user_id: 'justin_medeiros',
    content: '2022 Games prep highlights! 🏆 The journey to the Games starts months in advance. Check out the full training montage!',
    media_urls: [require('../assets/images/youtube covers/2022 Games Prep.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: null,
    tags: ['youtube', 'games', 'prep', 'training', 'highlights'],
    is_public: true,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 72 hours ago
    likes_count: 778,
    comments_count: 98,
    shares_count: 43,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  },
  {
    id: 'yt4',
    user_id: 'justin_medeiros',
    content: 'Affiliate Semifinals Event 3 breakdown! 💪 Strategy and execution are everything in competition. New video is up!',
    media_urls: [require('../assets/images/youtube covers/Crossfit in affiliate semifinals event 3.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: null,
    tags: ['youtube', 'semifinals', 'strategy', 'competition', 'breakdown'],
    is_public: true,
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 96 hours ago
    likes_count: 587,
    comments_count: 72,
    shares_count: 31,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    }
  }
];

// Mock user profiles
export const mockProfiles = {
  justin_medeiros: {
    id: 'justin_medeiros',
    first_name: 'Justin',
    last_name: 'Medeiros',
    avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
    followers_count: 125000,
    following_count: 847,
    posts_count: 234,
    bio: '2x CrossFit Games Champion 🏆 | Training, Nutrition & Mindset Coach | Helping athletes reach their potential'
  },
  ellie_turner: {
    id: 'ellie_turner',
    first_name: 'Ellie',
    last_name: 'Turner',
    avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg'),
    followers_count: 67500,
    following_count: 523,
    posts_count: 189,
    bio: 'CrossFit Athlete 🏋️‍♀️ | Mindset Coach | Empowering women in fitness | Train hard, stay humble 💪'
  }
};

// Mock comments with much more engagement
export const mockComments = {
  '1': [
    {
      id: 'c1',
      post_id: '1',
      user_id: 'user1',
      content: 'Your snatch technique is incredible! Any tips for getting more comfortable in the overhead position?',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        avatar_url: null
      }
    },
    {
      id: 'c2',
      post_id: '1',
      user_id: 'user2',
      content: 'Amazing form! Those Games victories didn\'t come from nowhere 🔥',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user2',
        first_name: 'Mike',
        last_name: 'Chen',
        avatar_url: null
      }
    },
    {
      id: 'c3',
      post_id: '1',
      user_id: 'user3',
      content: 'The mobility work is paying off! Can definitely see the improvement in your catch position.',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user3',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        avatar_url: null
      }
    },
    {
      id: 'c4',
      post_id: '1',
      user_id: 'ellie_turner',
      content: 'That positioning is chef\'s kiss! 👌 Your consistency in training is what sets you apart.',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      profiles: {
        id: 'ellie_turner',
        first_name: 'Ellie',
        last_name: 'Turner',
        avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg')
      }
    },
    {
      id: 'c5',
      post_id: '1',
      user_id: 'user4',
      content: 'Been working on my snatch for months and this gives me so much motivation! 💪',
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user4',
        first_name: 'Alex',
        last_name: 'Thompson',
        avatar_url: null
      }
    },
    {
      id: 'c6',
      post_id: '1',
      user_id: 'user5',
      content: 'The patience part is so real! Thanks for the reminder that progress takes time.',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user5',
        first_name: 'Jordan',
        last_name: 'Lee',
        avatar_url: null
      }
    }
  ],
  'ellie1': [
    {
      id: 'ce1',
      post_id: 'ellie1',
      user_id: 'justin_medeiros',
      content: 'That hip drive is looking explosive! 🔥 Keep grinding, the work is showing!',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'justin_medeiros',
        first_name: 'Justin',
        last_name: 'Medeiros',
        avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg')
      }
    },
    {
      id: 'ce2',
      post_id: 'ellie1',
      user_id: 'user6',
      content: 'Your clean technique is so smooth! Any mobility drills you recommend for better positioning?',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user6',
        first_name: 'Taylor',
        last_name: 'Davis',
        avatar_url: null
      }
    },
    {
      id: 'ce3',
      post_id: 'ellie1',
      user_id: 'user7',
      content: 'The grind never stops! 💪 You\'re such an inspiration to all of us trying to get better every day.',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user7',
        first_name: 'Casey',
        last_name: 'Brown',
        avatar_url: null
      }
    },
    {
      id: 'ce4',
      post_id: 'ellie1',
      user_id: 'user8',
      content: 'Love seeing strong women crushing it in the gym! 🙌',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user8',
        first_name: 'Morgan',
        last_name: 'Wilson',
        avatar_url: null
      }
    },
    {
      id: 'ce5',
      post_id: 'ellie1',
      user_id: 'user9',
      content: 'That transition under the bar is so clean! Goals right there 🎯',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user9',
        first_name: 'Sam',
        last_name: 'Martinez',
        avatar_url: null
      }
    }
  ],
  '2': [
    {
      id: 'c7',
      post_id: '2',
      user_id: 'user10',
      content: 'Depth looks perfect! What\'s your current squat PR?',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user10',
        first_name: 'Alex',
        last_name: 'Thompson',
        avatar_url: null
      }
    },
    {
      id: 'c8',
      post_id: '2',
      user_id: 'user11',
      content: 'Love the emphasis on fundamentals. This is what separates champions from everyone else.',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user11',
        first_name: 'Jordan',
        last_name: 'Lee',
        avatar_url: null
      }
    },
    {
      id: 'c9',
      post_id: '2',
      user_id: 'ellie_turner',
      content: 'Foundation strength is everything! Your squat form is textbook perfect 📚',
      created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      profiles: {
        id: 'ellie_turner',
        first_name: 'Ellie',
        last_name: 'Turner',
        avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg')
      }
    },
    {
      id: 'c10',
      post_id: '2',
      user_id: 'user12',
      content: 'Been struggling with my squat depth lately. This is the motivation I needed! 💪',
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user12',
        first_name: 'Riley',
        last_name: 'Parker',
        avatar_url: null
      }
    }
  ],
  'ellie2': [
    {
      id: 'ce6',
      post_id: 'ellie2',
      user_id: 'user13',
      content: 'Wodapalooza is going to be insane this year! You\'re going to crush it! 🏆',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user13',
        first_name: 'Blake',
        last_name: 'Anderson',
        avatar_url: null
      }
    },
    {
      id: 'ce7',
      post_id: 'ellie2',
      user_id: 'justin_medeiros',
      content: 'That run-swim combo is no joke! Your endurance base is looking solid 💪',
      created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'justin_medeiros',
        first_name: 'Justin',
        last_name: 'Medeiros',
        avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg')
      }
    },
    {
      id: 'ce8',
      post_id: 'ellie2',
      user_id: 'user14',
      content: 'The dedication is unreal! Can\'t wait to watch you compete 🔥',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user14',
        first_name: 'Avery',
        last_name: 'Collins',
        avatar_url: null
      }
    },
    {
      id: 'ce9',
      post_id: 'ellie2',
      user_id: 'user15',
      content: 'Run-swim workouts are my weakness! Any tips for the transition?',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user15',
        first_name: 'Quinn',
        last_name: 'Taylor',
        avatar_url: null
      }
    },
    {
      id: 'ce10',
      post_id: 'ellie2',
      user_id: 'user16',
      content: 'Your mental toughness is inspiring! The grind is real but so worth it 💫',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user16',
        first_name: 'Sage',
        last_name: 'Mitchell',
        avatar_url: null
      }
    }
  ],
  '3': [
    {
      id: 'c11',
      post_id: '3',
      user_id: 'user17',
      content: 'That clean looked effortless! The speed under the bar is insane.',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user17',
        first_name: 'Taylor',
        last_name: 'Davis',
        avatar_url: null
      }
    },
    {
      id: 'c12',
      post_id: '3',
      user_id: 'ellie_turner',
      content: 'The power transfer is everything! Your technique is so dialed in 🎯',
      created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'ellie_turner',
        first_name: 'Ellie',
        last_name: 'Turner',
        avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg')
      }
    },
    {
      id: 'c13',
      post_id: '3',
      user_id: 'user18',
      content: 'Been working on my clean & jerk for years and this is pure motivation! 🔥',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user18',
        first_name: 'Drew',
        last_name: 'Foster',
        avatar_url: null
      }
    }
  ],
  'ellie3': [
    {
      id: 'ce11',
      post_id: 'ellie3',
      user_id: 'justin_medeiros',
      content: 'Always a pleasure training with you! Your work ethic pushes everyone around you to be better 💪',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'justin_medeiros',
        first_name: 'Justin',
        last_name: 'Medeiros',
        avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg')
      }
    },
    {
      id: 'ce12',
      post_id: 'ellie3',
      user_id: 'user19',
      content: 'Two legends in one frame! 🙌 The energy you both bring is incredible',
      created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user19',
        first_name: 'Phoenix',
        last_name: 'Rivera',
        avatar_url: null
      }
    },
    {
      id: 'ce13',
      post_id: 'ellie3',
      user_id: 'user20',
      content: 'This is what training partnerships should look like! Mutual respect and pushing each other 🔥',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user20',
        first_name: 'Rowan',
        last_name: 'Hayes',
        avatar_url: null
      }
    },
    {
      id: 'ce14',
      post_id: 'ellie3',
      user_id: 'user21',
      content: 'The focus and intensity is unmatched! You both are goals 🎯',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user21',
        first_name: 'Emery',
        last_name: 'Brooks',
        avatar_url: null
      }
    },
    {
      id: 'ce15',
      post_id: 'ellie3',
      user_id: 'user22',
      content: 'Love seeing athletes supporting each other! This is what the community is all about 💫',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user22',
        first_name: 'Skyler',
        last_name: 'Morgan',
        avatar_url: null
      }
    },
    {
      id: 'ce16',
      post_id: 'ellie3',
      user_id: 'user23',
      content: 'Iron sharpens iron! 🗡️ You both make each other better every day',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user23',
        first_name: 'River',
        last_name: 'Stone',
        avatar_url: null
      }
    }
  ],
  'ellie4': [
    {
      id: 'ce17',
      post_id: 'ellie4',
      user_id: 'user24',
      content: 'This mindset is everything! Thank you for always sharing such positive energy 🙏',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user24',
        first_name: 'Sage',
        last_name: 'Williams',
        avatar_url: null
      }
    },
    {
      id: 'ce18',
      post_id: 'ellie4',
      user_id: 'justin_medeiros',
      content: 'Your perspective on the journey is so inspiring! Keep shining ✨',
      created_at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'justin_medeiros',
        first_name: 'Justin',
        last_name: 'Medeiros',
        avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg')
      }
    },
    {
      id: 'ce19',
      post_id: 'ellie4',
      user_id: 'user25',
      content: 'Needed to hear this today! Every challenge really does shape us 💪',
      created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user25',
        first_name: 'Dakota',
        last_name: 'Cruz',
        avatar_url: null
      }
    },
    {
      id: 'ce20',
      post_id: 'ellie4',
      user_id: 'user26',
      content: 'Your gratitude and positivity is contagious! Thank you for being such a light 🌟',
      created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user26',
        first_name: 'Finley',
        last_name: 'Reed',
        avatar_url: null
      }
    }
  ],
  'ellie5': [
    {
      id: 'ce21',
      post_id: 'ellie5',
      user_id: 'user27',
      content: 'Recovery day wisdom! 🧘‍♀️ The holy trinity is so real - stealing this phrase!',
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user27',
        first_name: 'Harley',
        last_name: 'Quinn',
        avatar_url: null
      }
    },
    {
      id: 'ce22',
      post_id: 'ellie5',
      user_id: 'justin_medeiros',
      content: 'Recovery is where the magic happens! Smart training includes smart recovery 💯',
      created_at: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'justin_medeiros',
        first_name: 'Justin',
        last_name: 'Medeiros',
        avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg')
      }
    },
    {
      id: 'ce23',
      post_id: 'ellie5',
      user_id: 'user28',
      content: 'I needed this reminder! Sometimes I feel guilty for taking rest days 😅',
      created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user28',
        first_name: 'Peyton',
        last_name: 'Gray',
        avatar_url: null
      }
    },
    {
      id: 'ce24',
      post_id: 'ellie5',
      user_id: 'user29',
      content: 'Mobility, meditation, meal prep - the trifecta! 🙌 Thanks for the reminder',
      created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user29',
        first_name: 'Cameron',
        last_name: 'Bell',
        avatar_url: null
      }
    }
  ],
  'yt1': [
    {
      id: 'c14',
      post_id: 'yt1',
      user_id: 'user30',
      content: 'This video was so helpful! Love getting insight into your prep process.',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user30',
        first_name: 'Casey',
        last_name: 'Brown',
        avatar_url: null
      }
    },
    {
      id: 'c15',
      post_id: 'yt1',
      user_id: 'ellie_turner',
      content: 'Had so much fun filming this with you! The behind-the-scenes prep work is everything 🎬',
      created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'ellie_turner',
        first_name: 'Ellie',
        last_name: 'Turner',
        avatar_url: require('../../assets/images/ellie turner/ellie_bio_small.jpg')
      }
    },
    {
      id: 'c16',
      post_id: 'yt1',
      user_id: 'user31',
      content: 'Ellie asking the real questions! 🔥 Can\'t wait for the next Games.',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user31',
        first_name: 'Morgan',
        last_name: 'Wilson',
        avatar_url: null
      }
    },
    {
      id: 'c17',
      post_id: 'yt1',
      user_id: 'user32',
      content: 'The chemistry between you two in videos is amazing! More collabs please! 🙏',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user32',
        first_name: 'Reese',
        last_name: 'Cooper',
        avatar_url: null
      }
    },
    {
      id: 'c18',
      post_id: 'yt1',
      user_id: 'user33',
      content: 'Your Games prep content is unmatched! The detail and strategy breakdowns are gold 🏆',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user33',
        first_name: 'Avery',
        last_name: 'James',
        avatar_url: null
      }
    }
  ]
};

// Featured posts for homepage
export const mockFeaturedPosts = [
  {
    ...mockYouTubePosts[0],
    is_featured: true,
    is_sponsored: false
  },
  {
    ...mockPosts[0],
    is_featured: true,
    is_sponsored: false
  },
  {
    ...mockPosts[6], // Mobility post
    is_featured: true,
    is_sponsored: false
  }
];

// Function to get all posts
export const getAllMockPosts = () => {
  return [...mockPosts, ...mockYouTubePosts].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
}; 