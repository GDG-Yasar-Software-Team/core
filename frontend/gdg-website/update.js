const fs = require('fs');
const path = 'C:/Users/burak/Pictures/Screenshots/core/frontend/gdg-website/src/pages/About/AboutPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = <div className="flex flex-col gap-24 py-16 px-6 lg:px-24 bg-[#fff] max-w-[1400px] mx-auto">
{events.map((event, index) => {
const isEven = index % 2 === 0;
const GDG_COLORS = [
'bg-[#4285F4]', // Blue
'bg-[#EA4335]', // Red
'bg-[#FBBC04]', // Yellow
'bg-[#34A853]', // Green
];
const bgColor = GDG_COLORS[index % GDG_COLORS.length];
const imageUrl =
event.image_url ||
GALLERY_IMAGES[(index + 1) % GALLERY_IMAGES.length].src;

return (
<section
key={event.id}
className={\lex flex-col \ w-full min-h-[40vh] bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden\}
>
<div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
<div className="w-full">
<div className={\inline-block px-5 py-2 mb-6 rounded-full text-xs font-bold tracking-widest uppercase \ text-white shadow-sm\}>
{event.event_type || "Event / Atölye"}
</div>
<h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-[#202124]">
{event.title}
</h3>
<p className="text-[#5f6368] text-base md:text-lg leading-relaxed mb-10 line-clamp-6">
{event.description}
</p>
{event.registration_form_url && (
<a
href={event.registration_form_url}
target="_blank"
rel="noopener noreferrer"
className={\inline-block text-white hover:brightness-110 font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-md w-max \\}
>
Kayýt Ol & Detaylarý Gör
</a>
)}
</div>
</div>

<div className="w-full lg:w-1/2 p-6 lg:p-8 flex items-center justify-center bg-gray-50/50">
<div className="relative w-full h-full min-h-[300px] lg:min-h-[450px] rounded-[1.5rem] overflow-hidden group shadow-md">
<img
src={imageUrl}
alt={event.title}
className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
/>
<div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
</div>
</div>
</section>
);
})}
</div>;

content = content.replace(/\{events\.map\(\(event, index\) => \{[\s\S]*?\}\)\}/, replacement);
fs.writeFileSync(path, content, 'utf8');
