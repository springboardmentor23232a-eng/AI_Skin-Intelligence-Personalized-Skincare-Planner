from app.database import SessionLocal
from app.models import Product


def seed_products():

    db = SessionLocal()

    try:

        # -------------------------------------------------
        # DO NOT ADD DUPLICATES
        # -------------------------------------------------

        existing_count = db.query(Product).count()

        if existing_count > 0:

            print(
                f"Products already exist: {existing_count}"
            )

            return


        # -------------------------------------------------
        # PRODUCT CATALOG
        # -------------------------------------------------

        products = [

            Product(
                name="Gentle Foaming Cleanser",
                category="Cleanser",
                description=(
                    "A gentle cleanser that removes excess oil "
                    "and impurities without stripping the skin."
                ),
                suitable_for="Combination, Oily, Sensitive",
                skin_type="Combination,Oily,Sensitive",
                concern="Acne,Oil Control",
                price=499,
                image_url="../images/cleanser.png"
            ),


            Product(
                name="Hydrating Barrier Moisturizer",
                category="Moisturizer",
                description=(
                    "A lightweight moisturizer designed to "
                    "support hydration and the skin barrier."
                ),
                suitable_for="Combination, Dry, Sensitive",
                skin_type="Combination,Dry,Sensitive",
                concern="Hydration,Sensitivity",
                price=599,
                image_url="../images/moisturizer.png"
            ),


            Product(
                name="Daily Sunscreen SPF 50",
                category="Sunscreen",
                description=(
                    "Broad-spectrum SPF 50 sunscreen for "
                    "daily protection against UV exposure."
                ),
                suitable_for="All Skin Types",
                skin_type="All",
                concern="Dark Spots,Pigmentation,Sun Protection",
                price=699,
                image_url="../images/sunscreen.png"
            ),


            Product(
                name="Brightening Vitamin C Serum",
                category="Serum",
                description=(
                    "A brightening serum designed to support "
                    "a more even-looking skin tone and dark spots."
                ),
                suitable_for="Combination, Oily, Normal",
                skin_type="Combination,Oily,Normal",
                concern="Dark Spots,Pigmentation,Brightening",
                price=799,
                image_url="../images/serum.png"
            ),


            Product(
                name="Acne Control Treatment",
                category="Treatment",
                description=(
                    "A targeted treatment designed to support "
                    "acne-prone skin and help reduce breakouts."
                ),
                suitable_for="Oily, Combination, Acne-Prone",
                skin_type="Oily,Combination",
                concern="Acne,Breakouts",
                price=749,
                image_url="../images/serum.png"
            ),


            Product(
                name="Sensitive Skin Soothing Moisturizer",
                category="Moisturizer",
                description=(
                    "A fragrance-free soothing moisturizer "
                    "designed for sensitive and easily irritated skin."
                ),
                suitable_for="Sensitive, Dry, Combination",
                skin_type="Sensitive,Dry,Combination",
                concern="Sensitivity,Redness,Hydration",
                price=649,
                image_url="../images/moisturizer.png"
            )

        ]


        # -------------------------------------------------
        # SAVE PRODUCTS
        # -------------------------------------------------

        db.add_all(products)

        db.commit()


        print(
            f"Successfully added {len(products)} products."
        )


    except Exception as e:

        db.rollback()

        print(
            "Error while adding products:"
        )

        print(e)


    finally:

        db.close()


if __name__ == "__main__":

    seed_products()