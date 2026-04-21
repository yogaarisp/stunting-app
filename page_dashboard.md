<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Nurturing Curator - Food Recommendations</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Be+Vietnam+Pro:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-container-high": "#e6e9e8",
                    "on-tertiary-container": "#5a3800",
                    "tertiary-fixed": "#ffddb6",
                    "surface-container": "#eceeed",
                    "surface": "#f8faf9",
                    "primary-fixed": "#75f8dc",
                    "tertiary-fixed-dim": "#ffb95a",
                    "secondary-fixed-dim": "#88d6b2",
                    "on-secondary-fixed": "#002115",
                    "on-primary-fixed-variant": "#005144",
                    "secondary-fixed": "#a3f3ce",
                    "primary-fixed-dim": "#55dcc0",
                    "primary": "#006b5b",
                    "outline": "#6c7a75",
                    "on-secondary-fixed-variant": "#005139",
                    "tertiary-container": "#e49c31",
                    "on-primary-fixed": "#00201a",
                    "inverse-primary": "#55dcc0",
                    "secondary-container": "#a3f3ce",
                    "secondary": "#156b4e",
                    "surface-dim": "#d8dada",
                    "on-secondary": "#ffffff",
                    "on-tertiary": "#ffffff",
                    "tertiary": "#845400",
                    "on-error": "#ffffff",
                    "surface-variant": "#e1e3e2",
                    "on-tertiary-fixed-variant": "#643f00",
                    "inverse-surface": "#2e3131",
                    "inverse-on-surface": "#eff1f0",
                    "on-background": "#191c1c",
                    "background": "#f8faf9",
                    "on-secondary-container": "#1e7154",
                    "on-primary": "#ffffff",
                    "error-container": "#ffdad6",
                    "on-tertiary-fixed": "#2a1800",
                    "outline-variant": "#bbcac4",
                    "on-primary-container": "#00483d",
                    "primary-container": "#2ebfa5",
                    "on-surface-variant": "#3c4945",
                    "surface-tint": "#006b5b",
                    "on-error-container": "#93000a",
                    "surface-container-lowest": "#ffffff",
                    "error": "#ba1a1a",
                    "surface-container-low": "#f2f4f3",
                    "surface-container-highest": "#e1e3e2",
                    "surface-bright": "#f8faf9",
                    "on-surface": "#191c1c"
            },
            "borderRadius": {
                    "DEFAULT": "1rem",
                    "lg": "2rem",
                    "xl": "3rem",
                    "full": "9999px"
            },
            "fontFamily": {
                    "headline": ["Plus Jakarta Sans"],
                    "body": ["Be Vietnam Pro"],
                    "label": ["Be Vietnam Pro"]
            }
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .editorial-shadow {
        box-shadow: 0px 24px 48px rgba(25, 28, 28, 0.06);
      }
      .glass-nav {
        backdrop-filter: blur(20px);
      }
    </style>
</head>
<body class="bg-surface font-body text-on-surface antialiased">
<!-- TopNavBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-3 bg-emerald-50/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
<div class="flex items-center gap-8">
<span class="text-xl font-bold bg-gradient-to-br from-emerald-700 to-teal-500 bg-clip-text text-transparent font-headline tracking-tight">Nurturing Curator</span>
<nav class="hidden md:flex gap-6">
<a class="text-emerald-800 dark:text-emerald-300 font-bold border-b-2 border-emerald-600 font-headline transition-colors" href="#">Food</a>
<a class="text-slate-600 dark:text-slate-400 font-medium font-headline hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors" href="#">Insights</a>
<a class="text-slate-600 dark:text-slate-400 font-medium font-headline hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors" href="#">Community</a>
</nav>
</div>
<div class="flex items-center gap-4">
<div class="hidden lg:flex items-center bg-surface-container-low px-4 py-1.5 rounded-full outline-variant/10 outline outline-1">
<span class="material-symbols-outlined text-on-surface-variant text-sm" data-icon="search">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm text-on-surface font-label ml-2 w-48" placeholder="Search recipes..." type="text"/>
</div>
<div class="flex gap-3">
<button class="text-emerald-700 dark:text-emerald-400 active:scale-95 duration-200">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-emerald-700 dark:text-emerald-400 active:scale-95 duration-200">
<span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
</button>
</div>
</div>
</header>
<main class="pt-24 pb-32 px-6 max-w-7xl mx-auto">
<!-- Hero Section / Context -->
<div class="mb-12">
<h1 class="text-display-lg font-headline font-extrabold text-on-surface tracking-tight mb-2">Curated for Growth</h1>
<p class="text-on-surface-variant max-w-xl body-lg">Personalized nutritional recommendations based on your child's current development stage and digestive history.</p>
</div>
<!-- Filter Bar -->
<div class="flex flex-wrap items-center gap-4 mb-10">
<button class="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full font-headline font-semibold text-sm active:scale-95 duration-200">
<span class="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
                Allergy Friendly
            </button>
<button class="bg-surface-container-high text-on-primary-container px-6 py-2.5 rounded-full font-headline font-medium text-sm hover:translate-x-1 transition-transform">
                Stage 1 (6m+)
            </button>
<button class="bg-surface-container-high text-on-primary-container px-6 py-2.5 rounded-full font-headline font-medium text-sm hover:translate-x-1 transition-transform">
                Lactose Free
            </button>
<div class="h-6 w-px bg-outline-variant/30 mx-2"></div>
<span class="text-label-md text-on-surface-variant italic">Showing 4 recommendations</span>
</div>
<!-- Food Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
<!-- Card 1 -->
<div class="group bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2">
<div class="relative h-48 w-full overflow-hidden">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="overhead shot of a colorful healthy toddler porridge with small pieces of steamed fish and vegetable garnish on a ceramic bowl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJFuX7V2B-j__M9kKbZ2lQHU73469u9SLibKmqTWtFOJrsAyAjgULWm9MpFbyORrEpLBe8b5Q2-09zcZzG6SPVvvRjJ5KRr_d46nVylqG2EyZNLg69_ggR4orGqSUcjof5Ls9BYbBvldbdvjrfnPeFli6aokuv8PWTu9z-7qB1roiJJzc5U98J3M4gdVv9bInbmP8TsuC7_GgV6w0QnWpS1fjQR_mqmwEwUfcbx_h36D_ZwNZaaaew6OKReCXjV84AunEvIgA_JVa3"/>
<div class="absolute top-4 left-4">
<span class="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary tracking-widest uppercase">Expert Pick</span>
</div>
</div>
<div class="p-6 flex flex-col flex-grow">
<div class="flex gap-2 flex-wrap mb-3">
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">High Protein</span>
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Omega-3</span>
</div>
<h3 class="text-headline-md font-headline font-bold text-on-surface mb-2">Bubur Ikan Kembung</h3>
<p class="text-on-surface-variant body-md leading-relaxed flex-grow">A gentle introduction to lean marine protein, steamed to perfection for easy digestion and cognitive support.</p>
<button class="mt-6 w-full py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-sm shadow-sm active:scale-95 transition-all">
                        View Recipe
                    </button>
</div>
</div>
<!-- Card 2 -->
<div class="group bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2">
<div class="relative h-48 w-full overflow-hidden">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="vibrant orange sweet potato mash in a white bowl with soft natural window lighting, creamy texture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqKHmDoHI0LXO3HDqv9v9KPI0KQJKOq9_bSwon-K3qCzxOv4gcADcRvrgqJt_RtGsw_I4wbwQcvQgO4DM-r9rQJ8-ZDj99mdkv__yBv0MSPsFnd2tCoSnSewIKApxyRdBubuviVaRjWbx1NcNOGRG2ij9jATypd28ITa66YIJo1gIdnRi0AFH-3csE4TeeJTL1-wOOO9ugeJaAPF4D5WAF-pjBNxX8LWifq-KlNnuJDtWjZyiIYD1Ox3eDobNtdTLw4N3TV2XjEPPO"/>
</div>
<div class="p-6 flex flex-col flex-grow">
<div class="flex gap-2 flex-wrap mb-3">
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Vitamin A</span>
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Fiber Rich</span>
</div>
<h3 class="text-headline-md font-headline font-bold text-on-surface mb-2">Mashed Sweet Potato</h3>
<p class="text-on-surface-variant body-md leading-relaxed flex-grow">Rich in beta-carotene, this naturally sweet mash is perfect for vision development and immune health.</p>
<button class="mt-6 w-full py-3 rounded-full bg-surface-container-high text-on-primary-container font-headline font-bold text-sm active:scale-95 transition-all">
                        View Recipe
                    </button>
</div>
</div>
<!-- Card 3 -->
<div class="group bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2">
<div class="relative h-48 w-full overflow-hidden">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="green spinach and apple puree in a small wooden bowl, bright natural green colors, fresh and organic style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmje4wBPpY3F1-U9DD6RBO9UyozUqEktuugrI74pef95rSjXsuXVwhEIJF_EovxoSIf9IADe36Y4ML-WA-aMokPFRltCzpcGm0Lp0khuNOIDwvHIpjNUfVyT0J1l3Xv0st1ErrErudmNx2xo69kVlS3R9j_WoCDkQFd-DIf_d4Oeae6RlAzgOHdQacY765lkh2db2u9JLh5CnjdSGaG_g5xgazSN5TcKTQo_Ny-Zvq8XgdR7TP1c1vAcB-dswhTyN9WLRVp456f-Uj"/>
</div>
<div class="p-6 flex flex-col flex-grow">
<div class="flex gap-2 flex-wrap mb-3">
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Iron Rich</span>
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Folate</span>
</div>
<h3 class="text-headline-md font-headline font-bold text-on-surface mb-2">Spinach &amp; Apple Glow</h3>
<p class="text-on-surface-variant body-md leading-relaxed flex-grow">A vibrant green blend that balances iron-dense spinach with the natural sweetness of organic gala apples.</p>
<button class="mt-6 w-full py-3 rounded-full bg-surface-container-high text-on-primary-container font-headline font-bold text-sm active:scale-95 transition-all">
                        View Recipe
                    </button>
</div>
</div>
<!-- Card 4 -->
<div class="group bg-surface-container-lowest rounded-lg editorial-shadow overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2">
<div class="relative h-48 w-full overflow-hidden">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="soft textured red lentil soup for babies in a small colorful pot, warm steam, cozy kitchen setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATKGCYlZX3bWiwHGnuFSPRbP9_ajHXrMJWzC_HR1HcbVlpiVBRFb7GhHsIErQtu0aMVZviF-su38QIktsv96g8ub7HGcB52y0rytduikZsZPkOaHobmV4S8gMnzeINgpgTcP3vFYG1Mf33SaLRc_nJn6RQOZzREve1eL2I8mZMGw6dmNnbxVQWzTFsPkNmj7XNY16XXG-E75ybiTBDSLOsvjwsYuznoDMSTugqrUvgFIwznZ9FsDRURmRK2WAC9PBwUBWEMxfXfZXk"/>
<div class="absolute top-4 left-4">
<span class="bg-tertiary-container/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-on-tertiary-container tracking-widest uppercase">Milestone Favor</span>
</div>
</div>
<div class="p-6 flex flex-col flex-grow">
<div class="flex gap-2 flex-wrap mb-3">
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Zinc Source</span>
<span class="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-semibold">Dairy Free</span>
</div>
<h3 class="text-headline-md font-headline font-bold text-on-surface mb-2">Red Lentil Comfort</h3>
<p class="text-on-surface-variant body-md leading-relaxed flex-grow">A silky-smooth plant protein source that’s easy on tiny tummies while providing essential minerals for bone growth.</p>
<button class="mt-6 w-full py-3 rounded-full bg-surface-container-high text-on-primary-container font-headline font-bold text-sm active:scale-95 transition-all">
                        View Recipe
                    </button>
</div>
</div>
</div>
<!-- Asymmetric Detail Section -->
<div class="mt-24 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
<div class="lg:col-span-2 order-2 lg:order-1">
<div class="bg-surface-container-low p-8 rounded-lg outline-variant/20 outline outline-1">
<h4 class="font-headline font-bold text-primary mb-4 flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="lightbulb">lightbulb</span>
                        Did You Know?
                    </h4>
<p class="text-on-surface-variant body-lg mb-6">Introducing varied textures between 6 and 9 months can significantly reduce the risk of picky eating later in life.</p>
<div class="h-3 w-full bg-primary-fixed rounded-full overflow-hidden">
<div class="bg-primary h-full w-3/4 rounded-full"></div>
</div>
<p class="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-2 text-right">Nutritional Diversity Score: 75%</p>
</div>
</div>
<div class="lg:col-span-3 order-1 lg:order-2">
<h2 class="text-display-md font-headline font-extrabold text-on-surface mb-6 leading-tight">The physics of tiny nutrition.</h2>
<p class="body-lg text-on-surface-variant leading-relaxed">Our curator doesn't just look at ingredients; it looks at bio-availability. We ensure that vitamin C sources are paired with iron-rich greens to maximize absorption for your little one's rapid development cycle.</p>
</div>
</div>
</main>
<!-- BottomNavBar (Mobile Only) -->
<footer class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-6 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] rounded-t-[32px]">
<button class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-5 py-2 hover:text-emerald-500 transition-all active:scale-90 duration-300">
<span class="material-symbols-outlined" data-icon="home">home</span>
<span class="font-plus-jakarta-sans text-[10px] uppercase tracking-wider mt-1">Home</span>
</button>
<button class="flex flex-col items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 rounded-2xl px-5 py-2 active:scale-90 duration-300">
<span class="material-symbols-outlined" data-icon="restaurant" style="font-variation-settings: 'FILL' 1;">restaurant</span>
<span class="font-plus-jakarta-sans text-[10px] uppercase tracking-wider mt-1">Food</span>
</button>
<button class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-5 py-2 hover:text-emerald-500 transition-all active:scale-90 duration-300">
<span class="material-symbols-outlined" data-icon="monitoring">monitoring</span>
<span class="font-plus-jakarta-sans text-[10px] uppercase tracking-wider mt-1">Insights</span>
</button>
<button class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-5 py-2 hover:text-emerald-500 transition-all active:scale-90 duration-300">
<span class="material-symbols-outlined" data-icon="person">person</span>
<span class="font-plus-jakarta-sans text-[10px] uppercase tracking-wider mt-1">Profile</span>
</button>
</footer>
</body></html>