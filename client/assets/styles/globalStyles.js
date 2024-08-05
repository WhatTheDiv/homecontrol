import { StyleSheet } from 'react-native'

export const appBackground = 'hsl(255, 100%, 5%)'
export const greenColor = "hsl(120,100%,30%)"
export const greenColor_a = "hsla(120,100%,30%,.6)"
export const chocolate_a = "hsla(7,85%,47%,.7)"
export const orangeColor = 'chocolate'
export const cold_coldColor = '#12EBFF'
export const mid_coldColor = '#1960EA'
export const hot_coldColor = '#A20BEA'
export const cold_hotColor = '#DB9E09'
export const hot_hotColor = '#D11608'
export const gray_a = "hsla(1,0%,50%,.6)"
export const cyanDColor = '#244242'
export const text_xsmall = 10
export const text_small = 12
export const text_medium = 16
export const text_large = 24
export const text_xlarge = 30

export default StyleSheet.create({
  appBackground: { backgroundColor: appBackground },
  background_black: { backgroundColor: "black" },
  background_white: { backgroundColor: "white" },
  background_orange: { backgroundColor: "chocolate" },
  background_red: { backgroundColor: 'red' },
  background_green: { backgroundColor: greenColor },
  background_blue: { backgroundColor: 'blue' },
  background_yellow: { backgroundColor: 'yellow' },
  background_gray: { backgroundColor: 'gray' },
  background_cyan: { backgroundColor: 'cyan' },
  background_cyanD: { backgroundColor: cyanDColor },
  background_coldHot: { backgroundColor: cold_hotColor },
  background_hotHot: { backgroundColor: hot_hotColor },
  background_coldCold: { backgroundColor: cold_coldColor },
  background_hotCold: { backgroundColor: hot_coldColor },

  border1: { borderWidth: 1, borderColor: "cyan" },
  border_red: { borderWidth: 1, borderColor: "red" },
  border_green: { borderWidth: 1, borderColor: greenColor },
  border_yellow: { borderWidth: 1, borderColor: "yellow" },
  border_cyan: { borderWidth: 1, borderColor: 'cyan' },
  border_orange: { borderWidth: 1, borderColor: 'chocolate' },
  border_white: { borderWidth: 1, borderColor: 'white' },
  border_pink: { borderWidth: 1, borderColor: 'pink' },
  border_gray: { borderWidth: 1, borderColor: 'gray' },
  border_rad5: { borderRadius: 5 },
  border_rad10: { borderRadius: 10 },
  border_rad20: { borderRadius: 20 },

  text_red: { color: 'red' },
  text_black: { color: 'black' },
  text_white: { color: 'white' },
  text_gray: { color: 'gray' },
  text_darkGray: { color: 'hsl(185,0%,5%)' },
  text_orange: { color: 'chocolate' },
  text_green: { color: greenColor },
  text_bold: { fontWeight: '600' },
  text_light: { fontWeight: '300' },
  text_center: { textAlign: 'center', },
  text_right: { textAlign: 'right', },

  text_xsmall: { fontSize: text_xsmall },
  text_small: { fontSize: text_small },
  text_medium: { fontSize: text_medium },
  text_large: { fontSize: text_large },
  text_xlarge: { fontSize: text_xlarge },

  flex_row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  justify_center: { justifyContent: 'center' },
  justify_around: { justifyContent: 'space-around' },
  justify_between: { justifyContent: 'space-between' },
  justify_end: { justifyContent: 'flex-end' },
  align_center: { alignItems: 'center' },
  align_start: { alignItems: 'flex-start' },
  align_end: { alignItems: 'flex-end' },
  relative: { position: 'relative' },
  absolute: { position: 'absolute' },

  width100: {
    width: '100%'
  },
  height100: {
    height: '100%'
  },
  width75: {
    width: '75%'
  },
  height75: {
    height: '75%'
  },
  width50: {
    width: '50%'
  },
  height50: {
    height: '50%'
  },
  width25: {
    width: '25%'
  },
  height25: {
    height: '25%'
  },
  margin5: {
    margin: 5
  },
  marginH5: {
    marginHorizontal: 5
  },
  marginV5: {
    marginVertical: 5
  },
  padding5: {
    padding: 5
  },
  paddingH5: {
    paddingHorizontal: 5
  },
  paddingV5: {
    paddingVertical: 5
  },
  marginH10: {
    marginHorizontal: 10
  },
  marginV10: {
    marginVertical: 10
  },
  padding10: {
    padding: 10
  },
  paddingH10: {
    paddingHorizontal: 10
  },
  paddingV10: {
    paddingVertical: 10
  },
  margin20: {
    margin: 20
  },
  marginH20: {
    marginHorizontal: 20
  },
  marginV20: {
    marginVertical: 20
  },
  padding20: {
    padding: 20
  },
  paddingH20: {
    paddingHorizontal: 20
  },
  paddingV20: {
    paddingVertical: 20
  },
})