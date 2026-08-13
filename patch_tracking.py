import re

with open("src/components/TrackingProvider.tsx", "r") as f:
    content = f.read()

func = """
    const addHtmlToElement = (html: string, target: HTMLElement, prepend = false) => {
      if (!html) return;
      try {
        const fragment = document.createRange().createContextualFragment(html);
        const scripts = fragment.querySelectorAll('script');
        
        // ContextualFragment doesn't execute scripts, so we have to manually recreate them
        const clonedFragment = document.createDocumentFragment();
        
        Array.from(fragment.childNodes).forEach(node => {
          if (node.nodeName.toLowerCase() === 'script') {
            const script = document.createElement('script');
            const oldScript = node as HTMLScriptElement;
            Array.from(oldScript.attributes).forEach(attr => {
              script.setAttribute(attr.name, attr.value);
            });
            script.text = oldScript.text;
            clonedFragment.appendChild(script);
          } else {
            clonedFragment.appendChild(node.cloneNode(true));
          }
        });

        if (prepend) {
          target.insertBefore(clonedFragment, target.firstChild);
        } else {
          target.appendChild(clonedFragment);
        }
      } catch (e) {
        console.error('Error injecting script', e);
      }
    };
"""

content = re.sub(
    r"const addHtmlToElement = \(html: string, target: HTMLElement, prepend = false\) => \{[\s\S]*?\}\n      \} catch \(e\) \{\n        console\.error\('Error injecting script', e\);\n      \}\n    \};",
    func.strip(),
    content
)

with open("src/components/TrackingProvider.tsx", "w") as f:
    f.write(content)
