// import ejs from "ejs";
// import path from "path";

// export const renderEmailTemplate = async (
//   templateName: string,
//   data: Record<string, unknown>
// ): Promise<string> => {
//   const templatePath = path.join(
//     process.cwd(),
//     "src",
//     "EmailTemplet",
//     `${templateName}.ejs`
//   );

//   return ejs.renderFile(templatePath, data);
// };


import ejs from "ejs";
import path from "path";

export const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, unknown>
): Promise<string> => {
  const templatePath = path.resolve(
    __dirname,
    "..",
    "templates",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};
