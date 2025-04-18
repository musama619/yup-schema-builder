import { ThemeProvider } from './components/theme-provider';
import YupSchemaGenerator from './components/YupSchemaBuilder';
import { ThemeSelector } from './components/ThemeSelector';
import { SparklesText } from './components/magicui/sparkles-text';
import { Footer } from './components/Footer';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className='relative min-h-screen flex flex-col'>
        <main className='flex-1 p-2 mb-24 '>
          <div className='relative  lg:max-w-10/12 mx-auto'>
            <div className='flex justify-between items-center mb-8'>
              <div></div>
              <SparklesText className='text-3xl' sparklesCount={3}>
                Yup Schema Builder
              </SparklesText>
              <ThemeSelector />
            </div>
            <YupSchemaGenerator />
          </div>
        </main>

        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
