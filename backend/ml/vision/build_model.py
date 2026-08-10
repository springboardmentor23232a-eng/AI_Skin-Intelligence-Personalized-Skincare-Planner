"""
GlowMix EfficientNetB0 Model Construction & Compilation Script
-------------------------------------------------------------
Constructs a transfer learning model using an ImageNet-pretrained EfficientNetB0 base,
adds custom classification head layers (GlobalAveragePooling2D, Dropout, Dense),
freezes base feature extractor weights, and compiles with Adam optimizer.
"""

import sys


def build_and_compile_glowmix_model(num_classes: int = 5, input_shape: tuple = (224, 224, 3)):
    """
    Builds and compiles the EfficientNetB0 Transfer Learning Model.

    Parameters:
    -----------
    num_classes : int, default=5
        Number of output classification target classes (acne, blackheads, dark spots, pores, wrinkles).
    input_shape : tuple, default=(224, 224, 3)
        Input tensor dimensions (height, width, channels).

    Returns:
    --------
    tf.keras.Model : Built and compiled Keras Model.
    """
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
    except ImportError:
        print("[ERROR] TensorFlow is not installed in your Python environment.")
        print("Please install TensorFlow using: pip install tensorflow")
        sys.exit(1)

    print("=" * 60)
    print(" EFFICIENTNETB0 MODEL CONSTRUCTION & COMPILATION")
    print("=" * 60)

    try:
        # 1. Load Pretrained EfficientNetB0 Base Model
        base_model = tf.keras.applications.EfficientNetB0(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape,
        )
        print("[STATUS] EfficientNetB0 Loaded Successfully")

        # 2. Freeze Base Model Weights
        base_model.trainable = False

        # 3. Build Custom Classifier Head Architecture
        inputs = layers.Input(shape=input_shape, name="input_image")
        x = base_model(inputs, training=False)
        x = layers.GlobalAveragePooling2D(name="global_avg_pooling")(x)
        x = layers.Dropout(0.30, name="head_dropout_1")(x)
        x = layers.Dense(128, activation="relu", name="dense_128")(x)
        x = layers.Dropout(0.20, name="head_dropout_2")(x)
        outputs = layers.Dense(num_classes, activation="softmax", name="output_predictions")(x)

        model = models.Model(inputs=inputs, outputs=outputs, name="GlowMix_EfficientNetB0")
        print("[STATUS] Model Built Successfully")

        # 4. Compile Model with Adam Optimizer (learning_rate=0.0001)
        optimizer = tf.keras.optimizers.Adam(learning_rate=0.0001)
        model.compile(
            optimizer=optimizer,
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )
        print("[STATUS] Model Compiled Successfully\n")

        # 5. Print Detailed Model Summary & Parameter Counts
        print("=" * 60)
        print("MODEL SUMMARY")
        print("=" * 60)
        model.summary()

        total_params = model.count_params()
        trainable_params = sum([tf.keras.backend.count_params(w) for w in model.trainable_weights])
        non_trainable_params = sum([tf.keras.backend.count_params(w) for w in model.non_trainable_weights])

        print("\n" + "-" * 60)
        print(" PARAMETER SUMMARY COUNTS")
        print("-" * 60)
        print(f" Total Parameters         : {total_params:,}")
        print(f" Trainable Parameters     : {trainable_params:,}")
        print(f" Non-trainable Parameters : {non_trainable_params:,}")
        print("-" * 60)

        print("\n" + "=" * 60)
        print("MODEL READY FOR TRAINING")
        print("=" * 60)

        return model

    except Exception as e:
        print(f"\n[ERROR] Exception occurred building EfficientNetB0 model: {e}")
        sys.exit(1)


if __name__ == "__main__":
    build_and_compile_glowmix_model()
