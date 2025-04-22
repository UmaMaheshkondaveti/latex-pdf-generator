const htmlToLatex = (htmlContent) => {
    try {
      // Replace HTML tags with LaTeX equivalents
      let latexContent = htmlContent;
      
      // Common HTML entities
      latexContent = latexContent.replace(/&lt;/g, '<');
      latexContent = latexContent.replace(/&gt;/g, '>');
      latexContent = latexContent.replace(/&amp;/g, '\\&');
      latexContent = latexContent.replace(/&quot;/g, '"');
      latexContent = latexContent.replace(/&apos;/g, "'");
      
      // Remove any script tags and their content
      latexContent = latexContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Basic formatting
      latexContent = latexContent.replace(/<h1>(.*?)<\/h1>/gi, '\\section{$1}\n\n');
      latexContent = latexContent.replace(/<h2>(.*?)<\/h2>/gi, '\\subsection{$1}\n\n');
      latexContent = latexContent.replace(/<h3>(.*?)<\/h3>/gi, '\\subsubsection{$1}\n\n');
      latexContent = latexContent.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
      latexContent = latexContent.replace(/<strong>(.*?)<\/strong>/gi, '\\textbf{$1}');
      latexContent = latexContent.replace(/<b>(.*?)<\/b>/gi, '\\textbf{$1}');
      latexContent = latexContent.replace(/<em>(.*?)<\/em>/gi, '\\textit{$1}');
      latexContent = latexContent.replace(/<i>(.*?)<\/i>/gi, '\\textit{$1}');
      latexContent = latexContent.replace(/<u>(.*?)<\/u>/gi, '\\underline{$1}');
      
      // Line breaks
      latexContent = latexContent.replace(/<br\s*\/?>/gi, '\\\\\n');
      
      // Lists - handle them differently to avoid regex complexity
      const olRegex = /<ol>([\s\S]*?)<\/ol>/gi;
      const ulRegex = /<ul>([\s\S]*?)<\/ul>/gi;
      const liRegex = /<li>([\s\S]*?)<\/li>/gi;
      
      // Process ordered lists
      let match;
      while ((match = olRegex.exec(htmlContent)) !== null) {
        let listContent = match[1];
        let latexList = '\\begin{enumerate}\n';
        
        let liMatch;
        while ((liMatch = liRegex.exec(listContent)) !== null) {
          latexList += `\\item ${liMatch[1]}\n`;
        }
        
        latexList += '\\end{enumerate}\n\n';
        latexContent = latexContent.replace(match[0], latexList);
      }
      
      // Process unordered lists
      while ((match = ulRegex.exec(htmlContent)) !== null) {
        let listContent = match[1];
        let latexList = '\\begin{itemize}\n';
        
        let liMatch;
        while ((liMatch = liRegex.exec(listContent)) !== null) {
          latexList += `\\item ${liMatch[1]}\n`;
        }
        
        latexList += '\\end{itemize}\n\n';
        latexContent = latexContent.replace(match[0], latexList);
      }
      
      // Clean up any remaining HTML tags
      latexContent = latexContent.replace(/<[^>]*>/g, '');
      
      // Escape special LaTeX characters (being careful not to escape already escaped ones)
      latexContent = latexContent.replace(/([^\\])([$&#%_{}])/g, '$1\\$2');
      
      // Handle special characters that need escaping in LaTeX
      latexContent = latexContent.replace(/\^/g, '\\textasciicircum{}');
      latexContent = latexContent.replace(/~/g, '\\textasciitilde{}');
      
      return latexContent;
    } catch (error) {
      console.error('Error converting HTML to LaTeX:', error);
      return `Error processing content: ${error.message}\\\\Please try again with simpler content.`;
    }
  };
  
  const mergeContentWithTemplate = (template, content) => {
    try {
      // Look for the content placeholder marker
      if (template.includes('% CONTENT_PLACEHOLDER')) {
        return template.replace('% CONTENT_PLACEHOLDER', content);
      }
      
      // If marker not found, try to insert content before \end{document}
      if (template.includes('\\end{document}')) {
        const parts = template.split('\\end{document}');
        return parts[0] + '\n\n' + content + '\n\n\\end{document}' + parts.slice(1).join('\\end{document}');
      }
      
      // If all else fails, just append content to the end
      return template + '\n\n' + content;
    } catch (error) {
      console.error('Error merging content with template:', error);
      return template; // Return original template on error
    }
  };
  
  // Add a simple test function
  const test = () => {
    return "LaTeX processor is working!";
  };
  
  module.exports = {
    htmlToLatex,
    mergeContentWithTemplate,
    test
  };