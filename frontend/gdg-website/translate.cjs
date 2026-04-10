const fs = require('fs');
const path = 'C:/Users/burak/Pictures/Screenshots/core/frontend/gdg-website/src/pages/About/AboutPage.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('Biz Kimiz?', 'Who Are We?');
content = content.replace('Bizler, sadece ders geçmek veya zorunlu staj aramak yerine,\r\n\t\t\t\t\t\t\t\tteknolojiyi öðrenmeye ve yeni bir þeyler üretmeye aþýk olduðumuz\r\n\t\t\t\t\t\t\t\tiçin toplanmýþ bir avuç Yaþar Üniversitesi öðrencisiyiz.', 'We are a group of Yaþar University students gathered because we love learning technology and creating new things, rather than just passing classes or looking for mandatory internships.');
content = content.replace('Aramýzda ilk kez \\"Hello World\\" yazmanýn heyecanýný yaþayanlar da\r\n\t\t\t\t\t\t\t\tvar, yýllardýr kendi projelerini kodlayanlar da... Amacýmýz\r\n\t\t\t\t\t\t\t\tmükemmel olmak deðil; birbirimizden öðrenmek, hata yapmaktan\r\n\t\t\t\t\t\t\t\tkorkmamak ve teknolojinin hýzýna hep birlikte ayak uydurmak. Ne\r\n\t\t\t\t\t\t\t\tkadar farklý koda baksak da ortak dilimiz: Üretmek.', 'There are some of us experiencing the excitement of writing \\"Hello World\\" for the first time, and some who have been coding their own projects for years... Our goal is not to be perfect; but to learn from each other, not be afraid of making mistakes, and keep up with the speed of technology together. No matter how different the code we look at, our common language is: Creating.');
content = content.replace('Topluluða Katýl', 'Join the Community');
content = content.replace('Neler Yapýyoruz?', 'What Do We Do?');
content = content.replace('Yapay zeka demolarýndan, teknik mülakat hazýrlýklarýna; saatlerce\r\n\t\t\t\t\t\tsüren kodlama atölyelerinden, alanýnda uzman isimleri dinlediðimiz\r\n\t\t\t\t\t\tseminerlere... Teoride býrakmayýp pratiðe döktüðümüz geçmiþ\r\n\t\t\t\t\t\tetkinliklerimize göz at.', 'From AI demos to technical interview preparations; from hours of coding workshops to seminars where we listen to experts in their fields... Check out our past events where we put theory into practice.');
content = content.replace('Event / Atölye', 'Event / Workshop');
content = content.replace('Kayýt Ol & Detaylarý Gör', 'Register & View Details');
content = content.replace('Ekibimizden Kareler', 'Moments From Our Team');
content = content.replace('Birlikte olduðumuz, öðrendiðimiz ve eðlendiðimiz her an...', 'Every moment we spend together, learning, and having fun...');

fs.writeFileSync(path, content, 'utf8');
