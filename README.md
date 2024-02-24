# expo-xml-font

Use Android XML Fonts easily with this Expo plugin.

This plugin builds off an awesome guide available at https://github.com/jsamr/react-native-font-demo on how to use XML Fonts in React Native but provides an easy to use API so you don't have to manually fiddle with the native files.

## Installation

> [!NOTE]  
> v3 is for Expo 50<= while v2 is for Expo 49>=

1. Install the plugin

```bash
# using yarn
yarn add expo-xml-font

# using npm
npm install expo-xml-font
```

2. Add the plugin to the `plugins` section of your `app.json` or `app.config.js` file:

```json
{
  "plugins": ["expo-xml-font"]
}
```

## Usage

This example will use Inter as an example, but you can use any font you like.

1. Get your font and all of its variants

```
Inter-Thin.ttf (100)
Inter-ExtraLight.ttf (200)
Inter-Light.ttf (300)
Inter-Regular.ttf (400)
Inter-Medium.ttf (500)
Inter-Semibold.ttf (600)
Inter-Bold.ttf (700)
Inter-Extrabold.ttf (800)
Inter-Black.ttf (900)
```

2. Change all the dashes ("-"s) to underscores ("\_") and all the uppercase letters to lowercase letters. This is required to be compatible with Android's asset names restrictions

```
inter_thin.ttf (100)
inter_extraLight.ttf (200)
inter_light.ttf (300)
inter_regular.ttf (400)
inter_medium.ttf (500)
inter_semibold.ttf (600)
inter_bold.ttf (700)
inter_extrabold.ttf (800)
inter_black.ttf (900)
```

3. Copy these files to a folder where your project is. You could put the font files in an `assets/fonts` folder for example.

4. Configure `expo-xml-font` in your `app.json` or `app.config.js`:

```json
{
  "plugins": [
    [
      "expo-xml-font",
      [
        {
          "name": "Inter",
          "folder": "assets/fonts",
          "variants": [
            { "fontFile": "inter_thin", "fontWeight": 100 },
            { "fontFile": "inter_extralight", "fontWeight": 200 },
            { "fontFile": "inter_light", "fontWeight": 300 },
            { "fontFile": "inter_regular", "fontWeight": 400 },
            { "fontFile": "inter_medium", "fontWeight": 500 },
            { "fontFile": "inter_semibold", "fontWeight": 600 },
            { "fontFile": "inter_bold", "fontWeight": 700 },
            { "fontFile": "inter_extrabold", "fontWeight": 800 },
            { "fontFile": "inter_black", "fontWeight": 900 }
          ]
        }
      ]
    ]
  ]
}
```

5. Run `expo prebuild` to generate the XML fonts. You can now use them in your code!

## Configuration

When using `expo-xml-font`, you need to pass in an object providing all the details of the font.

```ts
type Options = {
  /**
   * Name of font
   * @example "Inter"
   */
  name: string;
  /**
   * Path of folder which contains font files. It's alright if the path is relative.
   * @example "assets/fonts"
   */
  folder: string;
  variants: {
    /**
     * Font file for font. Do NOT include the extension.
     * @example "inter_regular.ttf" -> "inter_regular"
     */
    fontFile: string;
    /** The font weight of the provided font file */
    fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    /**
     * Specifies whether or not the font file is italic
     * @default false
     */
    italic?: boolean;
  }[];
}[];
```

Since this plugin takes in an array of fonts, you can specify as many font families as you want to.
