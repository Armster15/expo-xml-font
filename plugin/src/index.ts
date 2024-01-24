import { withMainApplication } from "expo/config-plugins";
import fs from "fs-extra";
import path from "node:path";
import type { ExpoConfig } from "expo/config";

interface WithXMLFontOptions {
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
}

/**
 * Expo plugin that creates an Android XML font
 */
const withAndroidXMLFont = (
  config: ExpoConfig,
  { folder, name, variants }: WithXMLFontOptions
) => {
  return withMainApplication(config, async (config) => {
    const fileName = name.replaceAll(' ', '_').toLowerCase();
    
    // 1. Modify MainApplication.java file
    const mainApplicaion = config.modResults.contents.split("\n");

    const importRNFontManagerLine = `import com.facebook.react.views.text.ReactFontManager;`;
    const addCustomFontLine = `ReactFontManager.getInstance().addCustomFont(this, "${name}", R.font.fileName});`;

    const isImportRNFontManagerLinePresent = !!mainApplicaion.find(
      (line) => line.trim() === importRNFontManagerLine
    );
    const isAddCustomFontLinePresent = !!mainApplicaion.find(
      (line) => line.trim() === addCustomFontLine
    );

    const line1 = mainApplicaion.findIndex(
      (line) => line.trim() === "import com.facebook.react.ReactPackage"
    );
    const line2 = mainApplicaion.findIndex(
      (line) => line.trim() === "super.onCreate()"
    );

    if (!isImportRNFontManagerLinePresent) {
      mainApplicaion.splice(line1 + 1, 0, importRNFontManagerLine);
    }
    if (!isAddCustomFontLinePresent)
      mainApplicaion.splice(line2 + 2, 0, addCustomFontLine);

    config.modResults.contents = mainApplicaion.join("\n");

    // 2. Copy fonts to respective Android folder
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
      path.join("android/app/src/main/res/font", `${fileName}.xml`),
      xml
    );

    return config;
  });
};

export default withAndroidXMLFont;
