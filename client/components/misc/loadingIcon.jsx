import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  withSequence,
  cancelAnimation,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import gs, { cyanDColor } from "../../assets/styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { runOnJS } from "react-native-reanimated";

const loadingIcon = ({ sqDim }) => {
  // Constants
  const centerCircleSize = 0.3;
  const bubbleSize = 0.05;
  const shakeDuration = 500;
  const shakeWidth = sqDim * 0.01;
  const shakeIteration = -1;
  const bubbleCount = 15;
  const bubbleDuration = 400;

  // Objects
  const centerCircle = new CenterCircle(
    sqDim,
    centerCircleSize,
    shakeDuration,
    shakeWidth,
    shakeIteration
  );

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const bubbles = [];
  let bubbleColor = 0;
  const bubbleColorArr = [
    "#bd1528", // red
    "#15bd3c", // green
    "#241ee3", // blue
    "#bd8d15", // orange
    "#d2e31e", // yellow
    "#1ee3cf", // cyan
  ];

  for (let i = 0; i < bubbleCount; i++) {
    bubbles[i] = new Bubble(
      sqDim,
      bubbleSize,
      randomIntFromInterval(bubbleDuration * 0.5, bubbleDuration),
      centerCircleSize,
      bubbleColorArr[bubbleColor]
    );
    bubbleColor =
      bubbleColor + 1 >= bubbleColorArr.length ? 0 : bubbleColor + 1;
  }

  useEffect(() => {
    centerCircle.shakeCircle();
    bubbles.forEach((bubble) => bubble.shootBubble());

    return () => {
      bubbles.forEach((bubble) => bubble.cleanupAnimation());
      centerCircle.cleanupAnimation();
    };
  }, []);

  return (
    <View style={[{ height: sqDim, width: sqDim }, styles.container]}>
      {centerCircle.render_centerCircle()}
      {bubbles.map((bubble, i) => bubble.render_bubble(i))}
    </View>
  );
};

export default loadingIcon;

class CenterCircle {
  constructor(
    sqDim,
    sizeMultiplier,
    shakeDuration,
    shakeWidth,
    shakeIteration
  ) {
    this.sqDim = sqDim;
    this.size = sqDim * sizeMultiplier;
    this.shakeDuration = shakeDuration;
    this.shakeWidth = shakeWidth;
    this.shakeIteration = shakeIteration;
    this.radius = this.size * 0.5;
    this.startTop = sqDim * 0.5 - this.radius;
    this.startLeft = sqDim * 0.5 - this.radius;
    const sp = {
      xLoc: useSharedValue(this.startLeft),
      yLoc: useSharedValue(this.startTop),
    };

    this.shakePosition = sp;
    this.animatedStyle = useAnimatedStyle(() => ({
      top: sp.yLoc.value,
      left: sp.xLoc.value,
    }));
  }

  randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  cleanupAnimation() {
    cancelAnimation(this.shakePosition.xLoc);
    cancelAnimation(this.shakePosition.yLoc);
  }

  render_centerCircle() {
    return (
      <Animated.View
        style={[
          styles.centerCircle,
          this.animatedStyle,
          {
            height: this.size,
            width: this.size,
            borderRadius: this.radius,
          },
        ]}
      >
        <LinearGradient
          colors={["#7fadad", cyanDColor]}
          end={{ x: 0.9, y: 0.9 }}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>
    );
  }

  shakeCircle() {
    this.shakePosition.xLoc.value = withRepeat(
      withSequence(
        withTiming(this.startLeft - this.shakeWidth, {
          duration: this.randomIntFromInterval(
            this.shakeDuration * 0.5,
            this.shakeDuration * 1
          ),
        }),
        withTiming(this.startLeft + this.shakeWidth, {
          duration: this.randomIntFromInterval(
            this.shakeDuration * 0.5,
            this.shakeDuration * 1
          ),
        })
      ),
      this.shakeIteration,
      true
    );

    this.shakePosition.yLoc.value = withRepeat(
      withSequence(
        withTiming(this.startTop - this.shakeWidth, {
          duration: this.randomIntFromInterval(
            this.shakeDuration * 0.5,
            this.shakeDuration * 1
          ),
        }),
        withTiming(this.startTop + this.shakeWidth, {
          duration: this.randomIntFromInterval(
            this.shakeDuration * 0.5,
            this.shakeDuration * 1
          ),
        })
      ),
      this.shakeIteration,
      true
    );
  }
}

class Bubble {
  constructor(sqDim, sizeMultiplier, duration, centerCircleSize, bubbleColor) {
    this.sqDim = sqDim;
    this.centerCircleRadius = sqDim * centerCircleSize * 0.5;
    this.size = sqDim * sizeMultiplier;
    this.radius = this.size * 0.5;
    this.startLeft = sqDim * 0.5 - this.radius;
    this.startTop = sqDim * 0.5 - this.radius;
    this.color = bubbleColor;
    this.relativeEnd = this.startLeft + this.sqDim * 0.5 - this.radius;
    this.duration = duration;

    const sp = {
      xLoc: useSharedValue(this.startLeft),
      yLoc: useSharedValue(this.startTop),
    };

    this.bubblePosition = sp;
    this.animatedStyle = useAnimatedStyle(() => ({
      top: sp.yLoc.value,
      left: sp.xLoc.value,
    }));
  }

  randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  render_bubble(key) {
    return (
      <Animated.View
        key={key}
        style={[
          {
            width: this.size,
            height: this.size,
            borderRadius: this.radius,
            backgroundColor: this.color,
          },
          this.animatedStyle,
          styles.bubble,
        ]}
      />
    );
  }

  cleanupAnimation() {
    cancelAnimation(this.bubblePosition.xLoc);
    cancelAnimation(this.bubblePosition.yLoc);
  }

  async shootBubble() {
    const singleShot = async (coord) => {
      const callbackFunc = () => {};
      const [xCoord, yCoord] = coord;
      return await new Promise((res, rej) => {
        this.bubblePosition.xLoc.value = withTiming(
          xCoord,
          {
            duration: this.duration,
          },
          () => runOnJS(res)(true)
        );
        this.bubblePosition.yLoc.value = withTiming(yCoord, {
          duration: this.duration,
        });
      });
    };
    const getRandomXY = () => {
      const randomQuadrant = this.randomIntFromInterval(1, 4);

      switch (randomQuadrant) {
        case 1:
          return [
            this.randomIntFromInterval(
              this.sqDim * 0.5,
              this.sqDim - this.size
            ),
            this.randomIntFromInterval(0, this.startTop),
          ];
        case 2:
          return [
            this.randomIntFromInterval(this.startLeft, this.sqDim - this.size),
            this.randomIntFromInterval(this.startTop, this.sqDim - this.size),
          ];
        case 3:
          return [
            this.randomIntFromInterval(0, this.sqDim * 0.5),
            this.randomIntFromInterval(this.startTop, this.sqDim - this.size),
          ];
        case 4:
          return [
            this.randomIntFromInterval(0, this.sqDim * 0.5),
            this.randomIntFromInterval(0, this.sqDim * 0.5),
          ];
        default:
          return [
            this.randomIntFromInterval(
              this.sqDim * 0.5,
              this.sqDim - this.size
            ),
            this.randomIntFromInterval(0, this.startTop),
          ];
      }
    };

    let animating = true;

    while (animating) {
      await singleShot(getRandomXY()).catch(() => (animating = false));
    }
  }
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    // overflow: "hidden",
  },
  centerCircle: {
    position: "absolute",
    zIndex: 1,
    overflow: "hidden",
  },
  bubble: {
    position: "absolute",
    zIndex: 0,
  },
});
