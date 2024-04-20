import { withMainApplication } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import fs from "fs-extra";
import path from "node:path";
import type { ExpoConfig } from "expo/config";

type WithXMLFontOptions = {
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

/**
 * Expo plugin that creates an Android XML font
 */
const withAndroidXMLFont = (config: ExpoConfig, fonts: WithXMLFontOptions) => {
  return withMainApplication(config, async (config) => {
    // 1. Modify MainApplication.java file
    let mainApplication = config.modResults.contents;

    // Adds "import com.facebook.react.views.text.ReactFontManager" line
    mainApplication = mergeContents({
      src: mainApplication,
      anchor: "import com.facebook.react.ReactPackage",
      newSrc: "import com.facebook.react.views.text.ReactFontManager",
      comment: "//",
      offset: 1,
      tag: "expo-xml-font:import-rn-font-manager-line",
    }).contents;

    // Adds custom font lines
    const addCustomFontLine = fonts
      .map(
        ({ name }) =>
          `ReactFontManager.getInstance().addCustomFont(this, "${name}", R.font.${formatName(name)})`
      )
      .join("\n");

    mainApplication = mergeContents({
      src: mainApplication,
      anchor: /^\s*super\.onCreate\(\)\s*$/, // "super.onCreate()"
      newSrc: addCustomFontLine,
      comment: "//",
      offset: 1,
      tag: "expo-xml-font:add-custom-font-line",
    }).contents;

    config.modResults.contents = mainApplication;

    // 2. Copy fonts to respective Android folders
    for (const { name, folder, variants } of fonts) {
      await fs.copy(folder, "android/app/src/main/res/font");

      // Validates that none of the files have a "-" or uppercase letters
      for (const file of await fs.readdir(folder)) {
        if (file.includes("-") || file.toLowerCase() !== file) {
          throw new Error(
            `Font files must not have dashes ("-") and must be all lowercase.`
          );
        }
      }

      // 3. Create XML File
      let xml =
        `<?xml version="1.0" encoding="utf-8"?>\n` +
        `<font-family xmlns:app="http://schemas.android.com/apk/res-auto">\n`;

      for (const { fontFile, fontWeight, italic } of variants) {
        xml += `    <font app:fontStyle="${
          italic ? "italic" : "normal"
        }" app:fontWeight="${fontWeight}" app:font="@font/${fontFile}" />\n`;
      }

      xml += `</font-family>`;

      await fs.writeFile(
        path.join("android/app/src/main/res/font", `${formatName(name)}.xml`),
        xml
      );
    }

    return config;
  });
};

// Turns a string into an Android friendly file-based resource name
// File-based resource names can contain only lowercase a-z, 0-9, or underscore
// Ex: "Plus Jakarta Sans" -> "plusjakartasans"
function formatName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '')
}

export default withAndroidXMLFont;
