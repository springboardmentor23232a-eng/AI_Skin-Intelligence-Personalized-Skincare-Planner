export const DEMO_ROLE_PROFILES = {
  USER: {
    id: 2,
    name: "John Doe",
    email: "john@gmail.com",
    role: "USER",
    provider: "LOCAL",
    profile_picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    phone: "+1 555-0192",
    bio: "Passionate user seeking personalized skin intelligence and science-backed routines.",
    skin_type: "Combination",
    skin_concerns: "Acne, Hyperpigmentation, Redness",
    allergies: "Fragrance sensitivity, High-concentration Benzoyl Peroxide",
    availability_status: "Active Member"
  },
  SKINCARE_CONSULTANT: {
    id: 3,
    name: "Dr. Emily Watson",
    email: "consultant@skincare.com",
    role: "SKINCARE_CONSULTANT",
    provider: "LOCAL",
    profile_picture: "https://images.unsplash.com/photo-1594824813566-88855ce78c90?w=300",
    phone: "+1 555-0195",
    bio: "Senior Skincare Consultant specializing in custom routine design and active ingredient synergy.",
    specialty: "Barrier Repair & Anti-Aging",
    license_number: "SC-449102",
    experience_years: "8 Years",
    qualification: "Certified Aesthetician & Dermal Specialist",
    hospital_clinic: "SkinIntelligence Wellness Center",
    consultation_fee: "$85 / session",
    availability_status: "Available for Consultation"
  },
  DERMATOLOGIST: {
    id: 4,
    name: "Dr. Michael Chen",
    email: "dermatologist@skincare.com",
    role: "DERMATOLOGIST",
    provider: "LOCAL",
    profile_picture: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
    phone: "+1 555-0196",
    bio: "Board-Certified Dermatologist specializing in clinical acne, eczema, and skin barrier pathology.",
    specialty: "Clinical & Surgical Dermatology",
    license_number: "MD-8839201",
    experience_years: "14 Years",
    qualification: "MD, FAAD (Fellow of American Academy of Dermatology)",
    hospital_clinic: "Metro Dermatology & Laser Center",
    consultation_fee: "$150 / session",
    availability_status: "Available for Consultation"
  },
  ADMIN: {
    id: 1,
    name: "Akash Prajapati",
    email: "akp73733@gmail.com",
    role: "ADMIN",
    provider: "LOCAL",
    profile_picture: "",
    phone: "+1 555-7373",
    bio: "Super Administrator with full multi-role access.",
    admin_role_title: "Super Administrator & Security Lead",
    availability_status: "Active"
  }
};

export const getDashboardForRole = (role) => {
  if (!role) return '/user';
  const r = role.toUpperCase();
  switch (r) {
    case 'ADMIN':
      return '/admin';
    case 'DERMATOLOGIST':
      return '/doctor';
    case 'SKINCARE_CONSULTANT':
    case 'CONSULTANT':
      return '/consultant';
    case 'USER':
    default:
      return '/user';
  }
};

export const normalizeRole = (role) => {
  if (!role) return 'USER';
  const r = role.toUpperCase();
  if (r === 'CONSULTANT' || r === 'SKINCARE_CONSULTANT') return 'SKINCARE_CONSULTANT';
  return r;
};
