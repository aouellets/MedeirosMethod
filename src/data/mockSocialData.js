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
    likes_count: 247,
    comments_count: 18,
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
    id: '2',
    user_id: 'justin_medeiros',
    content: 'Back squat day! 🏋️‍♂️ Focus on that deep position and driving through the heels. Every rep counts when you\'re building that foundation strength.',
    media_urls: [require('../assets/images/action shots/justin_squat.jpg')],
    media_types: ['image/jpeg'],
    exercise_name: 'Back Squat',
    tags: ['backsquat', 'strength', 'legday', 'fundamentals'],
    is_public: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes_count: 189,
    comments_count: 23,
    shares_count: 8,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
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
    likes_count: 156,
    comments_count: 14,
    shares_count: 6,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
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
    likes_count: 134,
    comments_count: 9,
    shares_count: 4,
    is_liked: true,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
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
    likes_count: 98,
    comments_count: 15,
    shares_count: 3,
    is_liked: false,
    profiles: {
      id: 'justin_medeiros',
      first_name: 'Justin',
      last_name: 'Medeiros',
      avatar_url: require('../assets/images/action shots/justinmain_leaderatgames.jpg'),
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
    likes_count: 167,
    comments_count: 21,
    shares_count: 9,
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
    likes_count: 203,
    comments_count: 31,
    shares_count: 15,
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
    likes_count: 121,
    comments_count: 12,
    shares_count: 5,
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
    likes_count: 412,
    comments_count: 67,
    shares_count: 23,
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
    tags: ['youtube', 'open', 'workout', 'technique', 'strategy'],
    is_public: true,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    likes_count: 324,
    comments_count: 45,
    shares_count: 18,
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
    likes_count: 256,
    comments_count: 34,
    shares_count: 14,
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
    likes_count: 187,
    comments_count: 28,
    shares_count: 11,
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
  }
};

// Mock comments
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
    }
  ],
  '2': [
    {
      id: 'c3',
      post_id: '2',
      user_id: 'user3',
      content: 'Depth looks perfect! What\'s your current squat PR?',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      profiles: {
        id: 'user3',
        first_name: 'Alex',
        last_name: 'Rodriguez',
        avatar_url: null
      }
    }
  ]
};

// Combine all posts for feed
export const getAllMockPosts = () => {
  return [...mockPosts, ...mockYouTubePosts].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
};

// Mock featured posts
export const mockFeaturedPosts = [
  mockPosts[0], // Snatch post
  mockYouTubePosts[0], // Latest YouTube video
  mockPosts[6] // Mobility post
]; 