# TypeScript Infinite Slider

A robust, highly performant, and completely free-to-use infinite slider component for React. Built with TypeScript and Tailwind CSS, it features smooth dragging mechanics (touch & mouse), auto-scrolling, and responsive design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![React](https://img.shields.io/badge/React-16.8+-61DAFB)

## Features

- ♾️ **True Infinite Scrolling**: Seamless looping of content.
- 👆 **Touch & Drag Support**: smooth physics-based dragging for both mobile and desktop.
- ⏯️ **Smart Auto-scroll**: Pauses on interaction and resumes automatically.
- 🎨 **Tailwind CSS**: Easy to style and customize.
- 📱 **Responsive**: Adapts to container width.
- ⌨️ **TypeScript**: Fully typed props and internal logic.

## Installation

Since this is a standalone component, you can simply copy the `TechnologiesSlider.tsx` file into your project.

1. **Copy the component**:
   Download `TechnologiesSlider.tsx` and place it in your components directory (e.g., `src/components/TechnologiesSlider.tsx`).

2. **Install Dependencies**:
   Ensure you have React and Tailwind CSS installed.

   ```bash
   npm install react react-dom
   # or
   yarn add react react-dom
   ```

3. **Tailwind Configuration**:
   The component uses some custom color names. You can either replace them in the code or add them to your `tailwind.config.js`:

   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           'brand-black': '#1a1a1a', // Example color
           'brand-light': '#f5f5f5', // Example color
           'brand-gray-700': '#374151', // Example color
         }
       }
     }
   }
   ```

## Usage

Import the component and pass the data via the `technologies` prop.

```tsx
import { TechnologiesSlider, TechnologyCategory } from './components/TechnologiesSlider';

const myTechnologies: TechnologyCategory[] = [
  {
      category: 'Frontend',
      technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
      category: 'Backend',
      technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
  },
  // Add more categories...
];

export default function App() {
  return (
    <div className="py-10">
      <TechnologiesSlider technologies={myTechnologies} />
    </div>
  );
}
```

## Customization

You can easily adjust the constants at the top of the file to change the behavior:

- `CARD_WIDTH`: Width of each slide card.
- `GAP`: Gap between cards.
- `AUTO_SCROLL_INTERVAL`: Speed of auto-scroll.
- `SLIDE_DURATION`: Duration of the snap animation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Check out [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
