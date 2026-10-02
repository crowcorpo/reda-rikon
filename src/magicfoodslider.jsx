import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './superbase.ts';
import { useAuth } from './authcontext.jsx';

const DEFAULT_BG = '#2b2420';

// ==========================
// EDIT THESE to change the hero text / price / description
// ==========================
const HERO_TITLE = 'PEACHBERRY';
const HERO_PRICE = '$120';
const HERO_DESC = 'Sweet, Tangy, Tropical Fresh! Kiwi & Lime with Crunchy toasted Almonds. On a bed of smooth Base';

function Slider() {

    const { isAdmin } = useAuth();

    const [ slides, setslides ] = useState([]);
    const [ colors, setcolors ] = useState({});
    const [ current, setcurrent ] = useState(0);
    const [ loading, setloading ] = useState(true);

    // ---- directional slide animation state ----
    const [ prevIndex, setprevIndex ] = useState(null);
    const [ direction, setdirection ] = useState(1);
    const [ entering, setentering ] = useState(true);
    const animTimeout = useRef(null);

    // ---- color picker state ----
    const [ pickingColor, setpickingColor ] = useState(false);
    const [ tempColor, settempColor ] = useState(DEFAULT_BG);

    const [ showDeleteConfirm, setshowDeleteConfirm ] = useState(false);
    const [ showEditModal, setshowEditModal ] = useState(false);
    const [ editFile, seteditFile ] = useState(null);
    const [ targetName, settargetName ] = useState(null);

    const touchstartX = useRef(null);

    // ==========================
    // fetch colors.json
    // ==========================
    const getColors = async () => {
        const { data, error } = await supabase.storage
            .from("admin-images")
            .download("admin/assets/slider/colors.json");

        if (error || !data) return {};

        try {
            const text = await data.text();
            return JSON.parse(text);
        } catch {
            return {};
        }
    }

    // ==========================
    // save colors.json
    // ==========================
    const saveColors = async (newColors) => {
        const blob = new Blob([ JSON.stringify(newColors) ], { type: "application/json" });
        const { error } = await supabase.storage
            .from("admin-images")
            .upload("admin/assets/slider/colors.json", blob, {
                upsert: true,
                contentType: "application/json"
            });
        if (error) console.error(error);
    }

    // ==========================
    // update one slide's color (called only on "validate")
    // ==========================
    const updateColor = async (name, color) => {
        const newColors = { ...colors, [ name ]: color };
        setcolors(newColors);
        await saveColors(newColors);
    }

    // ==========================
    // fetch slides
    // ==========================
    const getslides = async () => {

        setloading(true);

        const { data, error } = await supabase.storage
            .from("admin-images")
            .list("admin/assets/slider", { limit: 100, offset: 0 });

        if (error) {
            console.error(error);
            setloading(false);
            return;
        }

        const imgs = data
            .filter(item => item.name !== '.emptyFolderPlaceholder' && item.name !== 'colors.json')
            .map((item) => {
                const { data: pub } = supabase.storage
                    .from("admin-images")
                    .getPublicUrl(`admin/assets/slider/${item.name}`);
                return { name: item.name, url: pub.publicUrl };
            });

        const loadedColors = await getColors();

        setslides(imgs);
        setcolors(loadedColors);
        setcurrent(0);
        setprevIndex(null);
        setentering(true);
        setloading(false);
    }

    useEffect(() => { getslides(); }, []);

    // ==========================
    // trigger the slide-in animation
    // ==========================
    const triggerEnterAnim = () => {
        setentering(false);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setentering(true));
        });
        clearTimeout(animTimeout.current);
        animTimeout.current = setTimeout(() => {
            setprevIndex(null);
        }, 700);
    }

    // ==========================
    // go to a specific slide with a direction
    // ==========================
    const goTo = (newIndex, dir) => {
        if (newIndex === current || slides.length === 0) return;
        setdirection(dir);
        setprevIndex(current);
        setcurrent(newIndex);
        triggerEnterAnim();
    }

    // ==========================
    // auto play (always moves forward / from the right)
    // ==========================
    useEffect(() => {
        if (slides.length < 2 || pickingColor) return;
        const timer = setInterval(() => {
            setcurrent(prevCurrent => {
                const newIndex = (prevCurrent + 1) % slides.length;
                setdirection(1);
                setprevIndex(prevCurrent);
                triggerEnterAnim();
                return newIndex;
            });
        }, 4000);
        return () => clearInterval(timer);
    }, [ slides, pickingColor ]);

    // ==========================
    // arrow nav
    // ==========================
    const prev = useCallback(() => {
        goTo((current - 1 + slides.length) % slides.length, -1);
    }, [ current, slides.length ]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length, 1);
    }, [ current, slides.length ]);

    // ==========================
    // touch swipe
    // ==========================
    const onTouchStart = (e) => {
        touchstartX.current = e.touches[0].clientX;
    }

    const onTouchEnd = (e) => {
        if (touchstartX.current === null) return;
        const diff = touchstartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? next() : prev();
        }
        touchstartX.current = null;
    }

    // ==========================
    // upload
    // ==========================
    const upload = async (file) => {
        if (!file) return;
        const uniquename = `${Date.now()}_${file.name}`;
        const filepath = `admin/assets/slider/${uniquename}`;
        const { error } = await supabase.storage
            .from("admin-images")
            .upload(filepath, file);
        if (error) { console.error(error); return; }
        await getslides();
    }

    // ==========================
    // delete
    // ==========================
    const remove = async (name) => {
        const { error } = await supabase.storage
            .from("admin-images")
            .remove([`admin/assets/slider/${name}`]);
        if (error) { console.error(error); return; }

        const newColors = { ...colors };
        delete newColors[name];
        await saveColors(newColors);

        await getslides();
    }

    // ==========================
    // edit
    // ==========================
    const editslide = async (oldname, newfile) => {
        if (!newfile) return;
        const { error: delerror } = await supabase.storage
            .from("admin-images")
            .remove([`admin/assets/slider/${oldname}`]);
        if (delerror) { console.error(delerror); return; }

        const uniquename = `${Date.now()}_${newfile.name}`;
        const newpath = `admin/assets/slider/${uniquename}`;
        const { error: uploaderror } = await supabase.storage
            .from("admin-images")
            .upload(newpath, newfile);
        if (uploaderror) { console.error(uploaderror); return; }

        const oldColor = colors[oldname];
        const newColors = { ...colors };
        delete newColors[oldname];
        if (oldColor) newColors[uniquename] = oldColor;
        await saveColors(newColors);

        await getslides();
    }

    // ==========================
    // order button -> scrolls to products
    // ==========================
    const goToOrder = () => {
        document.getElementById("img7awifather")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const currentColor = (slides[current] && colors[slides[current].name]) || DEFAULT_BG;

    // ==========================
    // per-slide transform for the directional animation
    // ==========================
    const getSlideStyle = (i) => {
        if (i === current) {
            return {
                zIndex: 2,
                transform: entering
                    ? 'translateX(0)'
                    : (direction === 1 ? 'translateX(100%)' : 'translateX(-100%)')
            };
        }
        if (i === prevIndex) {
            return {
                zIndex: 1,
                transform: entering
                    ? (direction === 1 ? 'translateX(-100%)' : 'translateX(100%)')
                    : 'translateX(0)'
            };
        }
        return { zIndex: 0, transform: 'translateX(0)', display: 'none' };
    }

    return (
        <>
            {/* ======= BG SECTION ======= */}
            <div id="sl-section" style={{ '--sl-bg-color': pickingColor ? tempColor : currentColor }}>

                <div id="slwrap">

                    {/* ======= SLIDER BOX ======= */}
                    <div
                        id="slbox"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >

                        { loading &&
                            <div id="slloader">
                                <div id="slspinner"/>
                            </div>
                        }

                        { !loading && slides.length === 0 &&
                            <div id="slempty">
                                <p>no slides yet</p>
                                { isAdmin && <span>upload your first image below</span> }
                            </div>
                        }

                        {/* ======= BIG HERO TEXT (behind the bowl) ======= */}
                        { !loading && slides.length > 0 &&
                            <div id="slherotext">{HERO_TITLE}</div>
                        }

                        { !loading && slides.length > 0 &&
                            <>
                                { slides.map((slide, i) => (
                                    (i === current || i === prevIndex) &&
                                    <div
                                        id="slslide"
                                        key={slide.name}
                                        style={getSlideStyle(i)}
                                    >
                                        <img src={slide.url} alt="" />
                                    </div>
                                ))}

                                {/* ======= HERO CONTENT: buy button + price + description ======= */}
                                <div id="slherocontent">
                                    <div id="slherobuyrow">
                                        <button id="slbuybtn" onClick={goToOrder}>
                                            Buy Now
                                        </button>
                                        <span id="slprice">{HERO_PRICE}</span>
                                    </div>
                                    <p id="sldesc">{HERO_DESC}</p>
                                </div>

                                {/* ======= VERTICAL UP/DOWN NAV (right side) ======= */}
                                { slides.length > 1 &&
                                    <div id="slvertnav">
                                        <button id="slupvert" onClick={prev} aria-label="previous slide">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                                        </button>
                                        <button id="sldownvert" onClick={next} aria-label="next slide">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                        </button>
                                    </div>
                                }

                                { slides.length > 1 &&
                                    <div id="sldots">
                                        { slides.map((_, i) => (
                                            <button
                                                key={i}
                                                className={`sldot${i === current ? " slactive" : ""}`}
                                                onClick={() => goTo(i, i > current ? 1 : -1)}
                                            />
                                        ))}
                                    </div>
                                }

                                <div id="slcounter">
                                    {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                                </div>

                            </>
                        }

                        {/* ======= COLOR PICKING PANEL ======= */}
                        { pickingColor &&
                            <div id="slcolorpanel">
                                <input
                                    id="slcolor-input"
                                    type="color"
                                    value={tempColor}
                                    onChange={(e) => settempColor(e.target.value)}
                                />
                                <label htmlFor="slcolor-input" id="slcolorswatchlabel">
                                    <span id="slcolorswatchpreview" style={{ background: tempColor }} />
                                    <span>pick color</span>
                                </label>
                                <button id="slvalidatebtn"
                                    onClick={async () => {
                                        await updateColor(slides[current].name, tempColor);
                                        setpickingColor(false);
                                    }}>
                                    validate
                                </button>
                                <button id="slcancelcolorbtn"
                                    onClick={() => setpickingColor(false)}>
                                    cancel
                                </button>
                            </div>
                        }

                        {/* ======= ADMIN BUTTONS — bottom left/right, phone-style everywhere ======= */}
                        { isAdmin && slides.length >= 0 &&
                            <>
                                <input id="slup-input" type="file" accept="image/*"
                                    onChange={(e) => upload(e.target.files[0])}
                                />

                                {/* LEFT edge: upload + background */}
                                <div id="sladmin-left">
                                    <button id="slupbtn" title="upload"
                                        onClick={() => document.getElementById("slup-input").click()}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    </button>

                                    { slides.length > 0 &&
                                        <button id="slcolorbtn" title="background"
                                            onClick={() => {
                                                settempColor(currentColor);
                                                setpickingColor(true);
                                            }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9z"/></svg>
                                        </button>
                                    }
                                </div>

                                {/* RIGHT edge: edit + delete */}
                                { slides.length > 0 &&
                                    <div id="sladmin-right">
                                        <button id="sleditbtn" title="edit"
                                            onClick={() => {
                                                settargetName(slides[current].name);
                                                setshowEditModal(true);
                                                document.body.style.overflow = "hidden";
                                            }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>

                                        <button id="sldelbtn" title="delete"
                                            onClick={() => {
                                                settargetName(slides[current].name);
                                                setshowDeleteConfirm(true);
                                                document.body.style.overflow = "hidden";
                                            }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </button>
                                    </div>
                                }
                            </>
                        }

                    </div>
                    {/* end slbox */}

                </div>
                {/* end slwrap */}

            </div>
            {/* end sl-section */}

            {/* ======= DELETE MODAL ======= */}
            { showDeleteConfirm &&
                <div id="slmodalbg">
                    <div id="slmodal">
                        <div id="slmodalicon">⚠</div>
                        <h2 id="slmodaltext">delete this slide?</h2>
                        <p id="slmodalsub">this cannot be undone</p>
                        <div id="slmodalbtns">
                            <button id="slcancel"
                                onClick={() => {
                                    setshowDeleteConfirm(false);
                                    settargetName(null);
                                    document.body.style.overflow = "auto";
                                }}>cancel</button>
                            <button id="slconfirm"
                                onClick={async () => {
                                    await remove(targetName);
                                    setshowDeleteConfirm(false);
                                    settargetName(null);
                                    document.body.style.overflow = "auto";
                                }}>delete</button>
                        </div>
                    </div>
                </div>
            }

            {/* ======= EDIT MODAL ======= */}
            { showEditModal &&
                <div id="slmodalbg">
                    <div id="slmodal">
                        <div id="slmodalicon">✎</div>
                        <h2 id="slmodaltext">replace slide</h2>
                        <p id="slmodalsub">choose a new image</p>
                        <input id="sledit-input" type="file" accept="image/*"
                            onChange={(e) => seteditFile(e.target.files[0])}
                        />
                        <button id="slchoose" onClick={() => document.getElementById("sledit-input").click()}>
                            { editFile ? editFile.name : "choose file" }
                        </button>
                        <div id="slmodalbtns">
                            <button id="slcancel"
                                onClick={() => {
                                    setshowEditModal(false);
                                    settargetName(null);
                                    seteditFile(null);
                                    document.body.style.overflow = "auto";
                                }}>cancel</button>
                            <button id="slconfirm"
                                onClick={async () => {
                                    await editslide(targetName, editFile);
                                    setshowEditModal(false);
                                    settargetName(null);
                                    seteditFile(null);
                                    document.body.style.overflow = "auto";
                                }}>confirm</button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default Slider;