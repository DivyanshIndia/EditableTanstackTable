export interface User {
  id: string;
  name: string;
  wealth: number;
  active: boolean;
  bio: string;
  isEditing?: boolean;
}

const names = [
  "John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Green", "David White", 
  "Emma Wilson", "Frank Harris", "Grace Lee", "Helen Young", "Ivy Walker", "Jack King", 
  "Kathy Scott", "Liam Clark", "Mona Adams", "Nathan Evans", "Olivia Turner", "Paul Harris", 
  "Quincy Wright", "Rita Martin", "Steve Roberts", "Tina Perez", "Ursula Mitchell", "Victor Nelson", 
  "Wendy Carter", "Xander Garcia", "Yvonne Hernandez", "Zachary Davis"
];

const bios = [
  'Software engineer by day, gamer by night.',
  'Marketing manager with a passion for travel.',
  'Retired teacher with a love for gardening.',
  'Freelance writer with a flair for fiction.',
  'Entrepreneur always looking for new opportunities.',
  'Artist with a passion for abstract paintings.',
  'Professional chef and food enthusiast.',
  'Digital nomad who works from anywhere.',
  'Photographer capturing moments around the world.',
  'Fitness trainer with a love for healthy living.',
  'Scientist dedicated to climate change research.',
  'Tech enthusiast always experimenting with gadgets.',
  'Business analyst who loves problem-solving.',
  'Social worker dedicated to helping others.',
  'Musician with a dream of touring the world.',
  'Designer specializing in sustainable fashion.',
  'Writer and poet sharing stories with the world.',
  'Yoga instructor focusing on mental well-being.',
  'Lawyer committed to justice and equality.',
  'Architect passionate about sustainable buildings.',
  'Finance professional with a love for investing.',
  'Human resources manager building diverse teams.',
  'Engineer working on green technology innovations.',
  'Consultant advising companies on strategy.',
  'Teacher helping students achieve their potential.',
];

function getRandomName(): string {
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomBio(): string {
  return bios[Math.floor(Math.random() * bios.length)];
}

function getRandomBoolean(): boolean {
  return Math.random() > 0.5;
}

function getRandomWealth(): number {
  return Math.floor(Math.random() * 1000000);
}

 const generateDummyData = (): User[] => {
  const users: User[] = [];

  for (let i = 1; i <= 50; i++) {
    users.push({
      id: `user-${i}`,
      name: getRandomName(),
      wealth: getRandomWealth(),
      active: getRandomBoolean(),
      bio: getRandomBio(),
    });
  }

  return users;
};

export const DATA = generateDummyData();
