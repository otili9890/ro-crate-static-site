

module.exports = function (eleventyConfig) {
  eleventyConfig.addGlobalData("permalink", () => {
        return (data) =>
          `${data.page.filePathStem}.${data.page.outputFileExtension}`;
      });
  return { 


      dir : {
        input: "tmp",
        output: "dist",
        includes: "../_includes",
      }
   
    }
    };
