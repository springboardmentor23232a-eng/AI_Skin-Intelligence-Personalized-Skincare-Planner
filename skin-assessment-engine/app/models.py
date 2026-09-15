from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from datetime import datetime
from .database import Base


# =========================================================
# SKIN ASSESSMENT
# =========================================================

class SkinAssessment(Base):

    __tablename__ = "skin_assessment"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer)

    assessment_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Existing fields
    skin_health_score = Column(Integer)

    overall_condition = Column(String)

    notes = Column(Text)

    # =====================================================
    # AI ANALYSIS FIELDS
    # =====================================================

    skin_type = Column(String)

    main_concern = Column(String)

    hydration = Column(String)

    acne_level = Column(String)

    pigmentation = Column(String)

    risk_level = Column(String)

    redness = Column(String)

    texture = Column(String)

    sensitivity = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# SKIN CONCERN
# =========================================================

class SkinConcern(Base):

    __tablename__ = "skin_concern"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assessment_id = Column(Integer)

    concern_name = Column(String)

    severity = Column(String)

    priority = Column(String)


# =========================================================
# RISK FACTOR
# =========================================================

class RiskFactor(Base):

    __tablename__ = "risk_factor"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assessment_id = Column(Integer)

    risk_name = Column(String)

    description = Column(Text)

    risk_level = Column(String)


# =========================================================
# USER MODEL
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="USER"
    )

    provider = Column(
        String,
        default="LOCAL"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# =========================================================
# PRODUCT MODEL
# =========================================================

class Product(Base):

    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    description = Column(
        Text
    )

    suitable_for = Column(
        String
    )

    skin_type = Column(
        String
    )

    concern = Column(
        String
    )

    price = Column(
        Integer
    )

    image_url = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# INGREDIENT MODEL
# =========================================================
# Stores the main information about skincare ingredients.
#
# Examples:
# Retinoids
# Niacinamide
# Vitamin C
# Hyaluronic Acid
# Salicylic Acid
# Ceramides
# Peptides
# AHAs/BHAs
# =========================================================

class Ingredient(Base):

    __tablename__ = "ingredients"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    # Ingredient category
    category = Column(
        String,
        index=True
    )

    description = Column(
        Text
    )

    function = Column(
        String
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# INGREDIENT BENEFIT MODEL
# =========================================================
# Defines which skin types/concerns an ingredient can help.
#
# Example:
# Niacinamide → Combination → Acne → Oil control
# Hyaluronic Acid → Dry → Dehydration → Hydration
# =========================================================

class IngredientBenefit(Base):

    __tablename__ = "ingredient_benefits"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ingredient_id = Column(
        Integer,
        nullable=False
    )

    skin_type = Column(
        String
    )

    skin_concern = Column(
        String
    )

    benefit = Column(
        Text
    )

    suitability = Column(
        String
    )


# =========================================================
# PRODUCT INGREDIENT MODEL
# =========================================================
# Connects products with their ingredients.
#
# Example:
#
# Acne Control Treatment
#       ↓
# Salicylic Acid
#       ↓
# 2%
# =========================================================

class ProductIngredient(Base):

    __tablename__ = "product_ingredients"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        nullable=False
    )

    ingredient_id = Column(
        Integer,
        nullable=False
    )

    concentration = Column(
        String
    )

    notes = Column(
        Text
    )


# =========================================================
# INGREDIENT INTERACTION MODEL
# =========================================================
# Stores interactions between two skincare ingredients.
#
# Example:
#
# Retinoids + AHA/BHA
# → Can increase irritation
#
# Vitamin C + Niacinamide
# → Interaction information / usage guidance
# =========================================================

class IngredientInteraction(Base):

    __tablename__ = "ingredient_interactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ingredient_id_1 = Column(
        Integer,
        nullable=False
    )

    ingredient_id_2 = Column(
        Integer,
        nullable=False
    )

    interaction_type = Column(
        String
    )

    severity = Column(
        String
    )

    description = Column(
        Text
    )

    recommendation = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# INGREDIENT ALLERGY MODEL
# =========================================================
# Stores allergy / sensitivity information for ingredients.
#
# This will later allow the system to check:
#
# User sensitivity
#        +
# Product ingredients
#        ↓
# Allergy / irritation warning
# =========================================================

class IngredientAllergy(Base):

    __tablename__ = "ingredient_allergies"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ingredient_id = Column(
        Integer,
        nullable=False
    )

    allergy_name = Column(
        String
    )

    symptoms = Column(
        Text
    )

    severity = Column(
        String
    )

    warning = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# USER INGREDIENT ALLERGY MODEL
# =========================================================
# Stores ingredients that a particular user has reported
# as causing allergy or sensitivity.
#
# Example:
#
# User ID: 4
# Ingredient: Fragrance
# Reaction: Redness
# =========================================================

class UserIngredientAllergy(Base):

    __tablename__ = "user_ingredient_allergies"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    ingredient_id = Column(
        Integer,
        nullable=False
    )

    reaction = Column(
        Text
    )

    severity = Column(
        String
    )

    notes = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# INGREDIENT SUITABILITY MODEL
# =========================================================
# Gives a direct AI suitability result for an ingredient
# against a particular skin profile.
#
# Example:
#
# Salicylic Acid
# Combination Skin
# Acne
# Moderate suitability
# =========================================================

class IngredientSuitability(Base):

    __tablename__ = "ingredient_suitability"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    ingredient_id = Column(
        Integer,
        nullable=False
    )

    skin_type = Column(
        String
    )

    skin_concern = Column(
        String
    )

    suitability = Column(
        String
    )

    reason = Column(
        Text
    )

    caution = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# INGREDIENT CATEGORY MODEL
# =========================================================
# Stores standardized ingredient categories.
#
# Examples:
#
# Retinoids
# Niacinamide
# Vitamin C
# Hyaluronic Acid
# Salicylic Acid
# Ceramides
# Peptides
# AHAs/BHAs
# =========================================================

class IngredientCategory(Base):

    __tablename__ = "ingredient_categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    description = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )