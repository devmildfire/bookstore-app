--
-- PostgreSQL database dump
--

\restrict 9cAVFG37jR7cM21pSu66e8j6a30fefxEYvwSI0Uc3J1XuP5IxvAmXhwEpaArGAR

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: AdminAuditLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Authors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Authors" (id, name, bio, photo, birth_date, death_date, city, phrase, nonsalable, photo_blur) FROM stdin;
7	Эрнст Т. А. Гофман	\N	\N	\N	\N	\N	\N	f	\N
11	Издательство Чтиво	\N	\N	\N	\N	\N	\N	f	\N
31	Анна Пашкова	\N	\N	\N	\N	\N	\N	f	\N
38	Василий Вялый	\N	\N	\N	\N	\N	\N	f	\N
29	Николай Старообрядцев	Николай Старообрядцев — петербургский писатель, автор мистических романов и философских притч. Окончил филологический факультет СПбГУ, работал журналистом, редактором, преподавателем литературы. Дебютировал в 2010 году сборником рассказов «Тихие пристани». Литература для него — способ осмысления невидимой стороны мира: герои его книг ищут смысл в случайностях, чудесах и снах, балансируют на границе реальности и тайного знания. Лауреат премии «Северная звезда» (2017), финалист «Большой книги» (2019). Живёт и работает в Санкт-Петербурге.	nikolay-staroobryadtsev.jpg	1983-10-12	\N	Санкт-Петербург	Я исповедую физиологический метод письма. Описание и его предмет должны быть единым организмом: нужно научиться быть стоптанным сапогом, осколком кувшина, водосточной трубой, бешеной собакой, сквозняком или стороной треугольника. И когда далёкое и чужое обратится в интимнейшую дрожь — только тогда можно дотронуться до письменных принадлежностей	f	\N
17	Владимир Дивинский	Розыскная ориентировка Дивинский Владимир Алексеевич, 21 год. Славянский тип внешности, телосложение упитанное. Рост 186, вес 83. Глаза серо-голубые. Татуировок нет, в правом ухе пирсинг в виде серьги с изображением лица викинга, несущегося в Валгаллу. Уже в четвёртом классе показал кулак завучу школы, запретившей ему бегать в коридорах по причине перелома позвоночника. После чего продолжил бегать, но уже с красным от слёз лицом. Получил острое заболевание глаз — скорее всего, из-за некорректно проведенной операции. В ходе лечения подвергался инъекциям эпинефрина прямо в глазные яблоки, после чего поведение разыскиваемого стало ещё более непредсказуемым и агрессивным. В период средней школы пытается делать ирокез из кудрявых волос, красит его в розовый цвет. Пугает кавказцев и футбольных хулиганов возле торгового центра «Пассаж» в составе неформальной группировки. Впервые активно пробует сигареты и Blazer, который вскоре навсегда уходит из продажи. Неистово верит в неминуемую победу анархии и примитивизма. Готовится жить в землянке под разрушенной штаб-квартирой «Сбербанка». Вместе с группой друзей находит заброшенную котельную. Обустраивает её под убежище, расписывая стены из баллончиков. В качестве церемонии открытия разбивает о стену игровую клавиатуру. Участвует в конфликте за здание с организаторами ролевых игр, с достоинством проиграв, а затем сбежав от полицейского кортежа. Как опознавательный знак, носит куртку из искусственной кожи с надписью «Готов ли ты к зомби-апокалипсису?» на спине. Вместе с местом в медицинском университете получает разбитое сердце и необходимость искать себя в течении двух лет. Затем, спустя долгое радиомолчание, бреется налысо, оказавшись здесь. Что дальше?	author_divinski.jpg	\N	\N	Екатеринбург	«У тебя всегда остаётся немного сил — даже если это силы на то, чтобы ныть и огрызаться»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPAAgDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAID/8QAHRABAQACAgMBAAAAAAAAAAAAAQIAAxEhBDFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAD/8QAFxEBAAMAAAAAAAAAAAAAAAAAABIhYf/aAAwDAQACEQMRAD8AynaI6JqeSgQeV6/cZPg771aqJJkndK8Pvp+4ycNKf//Z
36	Александр Гаврилов	\N	author_gavrilov.jpg	\N	\N	Лобня	«Я вовремя понял, что постигать смысл жизни — пустое занятие: это не удастся никому».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQME/8QAHxAAAgEDBQEAAAAAAAAAAAAAAQIAAxIxBREhNnSx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAWEQEBAQAAAAAAAAAAAAAAAAABAAL/2gAMAwEAAhEDEQA/AMbKo09a9zXs5BBHAkBVXbJiNXr7+gfIGcyesBFL/9k=
32	Андрей Янкус	Историк предлагаемых событий, психонавт и подпольный философ родом из глухой тайги. Впервые увидел асфальт в семь лет. Окончил филологический факультет Томского государственного университета. Работал актёром кукольного театра, преподавателем по истории искусств, плотником, кочегаром, барменом, арт-директором, играл «Мурку» по кабакам.	author_yankus.jpg	\N	\N	\N	«У человека четыре конечности — и одна бесконечность».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAMAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwX/xAAgEAACAQQCAwEAAAAAAAAAAAABAgMABBEhEjEFFVHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AE91LJ5qaMXAa0UcQI9g67OvtTXa+V2U3kikHGBMcCoUMzwPyjODjFMb+QkkohJ70f2g/9k=
35	Эрих фон Нефф	\N	author_vonNeff.jpg	\N	\N	Сан-Франциско	'Have a beer and a blowjob and relax'	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPAAkDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQIE/8QAIhAAAgEDAgcAAAAAAAAAAAAAAQIDAAQREhUFEyJUkaHw/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAVEQEBAAAAAAAAAAAAAAAAAAAAIf/aAAwDAQACEQMRAD8ANCW3EA6xdE50rCpbzmse33nbv6pOxurXko4gQSquNQXBq9wPwpqcf//Z
37	Алексей Колесников	\N	author_kolesnikov.jpg	\N	\N	Белгород	«Настоящая удача случается раза два за всю страницу. Всё дело в словах — тяжело подобрать подходящие».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAANAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQIG/8QAIBAAAgICAgIDAAAAAAAAAAAAAQIDBAARBRIGIUFhcf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQACEf/aAAwDAQACEQMRAD8AQs8tUrko1mPaNpwDsjLW7XdQyyxkMNg9syPNQrW5OdEJI7Fvf37xut41TlrRSNJOC6Bjph8j8ydwclFv/9k=
39	Алексей Михайлов	\N	author_mihailov.jpg	\N	\N	Санкт-Петербург	«Мудрость веков, как в пустыне вода —	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQIG/8QAIBAAAgEDBAMAAAAAAAAAAAAAAQIDAAQRBSFBURIxYf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8AjUUuEuJp1nkWRCGiQE4K9Y55pxd1BbYkbjqsjp08pivGMrlvH2WOaftpJDbREuxJQZJPyiGv/9k=
9	Сергей Дедович	Шеф-редактор Русского Динозавра, враг хорошего, зачинщик глобальных приколов, любимый сын Господа Бога, крушитель Министерства хаоса, убийца метамодерна.	author_dedovich.jpg	\N	\N	Санкт-Петербург	«Это не то, чем оно является».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMG/8QAHhAAAQMEAwAAAAAAAAAAAAAAAQACAxESMUEhUXH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AzLnsbDaBdIck4HirHMBG0XN4A2haCTQdIP/Z
6	Эдуард Диа Диникин	Писатель, актёр, сценарист. Автор поэтического сборника ‘Mein Keif’, романа «Московский психопат», сборников «Поколение Лимонки», «Манифестофель» и ‘Summer. Day. Butterfly’. Имеет публикации в журналах «Урал», «Бронзовый век» и других. Является одним из ярких представителей литературного направления «Уральский магический реализм». Живёт в Санкт-Петербурге.	author_dinikin.jpg	\N	\N	Санкт-Петербург	«— Мы все когда-нибудь умрём. Правда, Бим? — Правда, Бом».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIE/8QAHhAAAgIABwAAAAAAAAAAAAAAAAIBEQUSFSNRYaH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAAQD/2gAMAwEAAhEDEQA/AITH95Vpcsrd9mjW55X0AYxS/9k=
34	Вячеслав Немиров	Учился на филологическом факультете Государственного института русского языка им. А. С. Пушкина и на факультете международной журналистики МГИМО МИД России. Пишет поэзию, прозу и критические статьи. Имеет публикации в журналах и интернет-изданиях, среди которых — «Волга», «Дискурс», «Нижний Новгород», «Полутона», «Формаслов».	author_nemirov.jpg	\N	\N	Москва	«Больше всего я боюсь, что однажды напишу гениальную вещь, но сам этого не пойму».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAMAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgQF/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQRIRJBBSIxYf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAXEQEBAQEAAAAAAAAAAAAAAAABACEC/9oADAMBAAIRAxEAPwCR/LW8Vyy8ZCQ2C466+d1qBuQDAAg7zvdF4oFuJVLlvd8HH7SZIwqKoJwAAN0cGQdJl//Z
5	Фарангис Авазматова	Прозаик и поэт. Её рассказы были опубликованы в журналах «Звезда востока», «Дружба народов», «Литературные знакомства». В 2022 году по итогам республиканского семинара молодых литераторов «Зааминские ласточки» выбрана для участия в проекте Союза писателей Узбекистана ‘Birinchi kitobim’ («Моя первая книга»). В 2023 году в рамках проекта издан рассказ «Ночной базар».	author-avazmatova.jpg	\N	\N	Ташкент	«В мирах, которые я создаю, живут совершенно разные существа: и мрачные эфриты, рождённые из огня и тьмы, и прекрасные пери, выручающие людей в трудную минуту, и джинны, и гули, и много кто ещё. Там живут и ведьмы — загадочные алвасти, балансирующие на грани между человеческим миром и бесконечным множеством других миров. Мне думается, что образ ведьм в моей мифологии очень похож на то, какими мне видятся писатели: они против несправедливости, они борются с неравенством, и они всегда тихонько наблюдают за всеми»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAhEAABAwQBBQAAAAAAAAAAAAABAAISBBEhcSIDBRMyQf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAQD/2gAMAwEAAhEDEQA/AERqq6sc7oWEI+Iyw035E7GFduhdn40rI4ufmkx3sdqhG//Z
10	Владислав Несветаев	Любящий муж, сценарист, режиссёр, отец нерожденных детей (двух-трёх), путешественник поневоле.	author_nesvetaev.jpg	\N	\N	Обнинск	И в этом отчаянном крае, Под волчьим оскаленным лаем, По шапку нырнув в это месиво, Я увидел, как дым превращается в дерево	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAANAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAfEAACAwACAgMAAAAAAAAAAAABAgMEEQAhBTESE+H/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABkRAQACAwAAAAAAAAAAAAAAAAEAAhIhUf/aAAwDAQACEQMRAD8AXalexCwqxH7eiNbNw98M1ryysVybo57/AHiqEjy2rNaVvmYSCrYB16zOWEjCIq6Tgzd5KyO1jx5P/9k=
19	Даша Стрельцова	\N	author_strelcova.jpg	\N	\N	Москва	«Проза и всё ей подобное происходит от сильного чувства, тщательно скрываемого внутри»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAEEBf/EACAQAAICAQMFAAAAAAAAAAAAAAECABEDBBJBISIxMlH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AMFu3GOasG4BWr1Eevy7HZAopqJPNiUrpk2jq3j7BX//2Q==
14	Размик Кочарян	Не любит писать о себе в третьем лице, но вынужден это делать. Вынужден работать креатором в корпорации, но не любит работать креатором в корпорации. Не любит быть вынужденным, но вынужден быть вынужденным. Надеется, что это временно.	author-kocharyan.jpg	\N	\N	Москва	«Я не буду раздражающе счастливым, не переживайте. Просто мне будет хотеться жить чуть больше, чем принято».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMG/8QAHRAAAgICAwEAAAAAAAAAAAAAAQMCEQAxBBJRYf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDLpQGKdMyMSuNxFX2N6yN/Bi+LyOiisqgy7IvevcJgf//Z
15	Сергей Рок	Писатель, поэт, деятель контркультуры. Работает веб-разработчиком. Создатель, редактор и модератор литературных и альтернативных проектов в сети. По образованию программист. Автор книг «Разговор с джинсами», «Панкомат» и других.	author-rock.jpg	\N	\N	Краснодар	«Литература — это как симптоматическое, так и биологическое. Рыбы плавают в воде. Крабы сидят на дне. У писателя тоже — своя вода, своё дно».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAHAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAHxAAAQMDBQAAAAAAAAAAAAAAAQACAwQRIRMiMULB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AM450VLJpyxkuadwvi3qqijcABHUzBnUY4REH//Z
21	Фёдор Достоевский	Родился в Москве. В 1837 году после смерти матери Фёдор Михайлович вместе с отцом и братом переехал в Санкт-Петербург. Окончил Главное инженерное училище. В 1845 году написал свой первый роман — «Бедные люди». В 1846 году выходит повесть «Двойник». Помимо крупной прозы, в начале своего творческого пути Достоевский писал произведения малой формы, которые менее известны широкому кругу читателей, в том числе рассказы «Ползунков» о мелком чиновнике и его неудачной первоапрельской шутке, «Честный вор» с одним из «положительно прекрасных» персонажей писателя, а также «Чужая жена» и «Ревнивый муж», которые в 1860 году при издании первого двухтомного собрания сочинений были объединены под названием «Чужая жена и муж под кроватью». В 1849 году писателя арестовали по делу петрашевцев и после инсценировки казни отправили на каторжные работы. В 1857 году он получил помилование. На 60–80-е годы XIX века приходится расцвет его творчества: в это время он написал так называемое «Пятикнижие» — романы «Преступление и наказание», «Идиот», «Бесы», «Подросток», «Братья Карамазовы». При этом публикуется и малая проза Достоевского: в 1862 году сатирический рассказ «Скверный анекдот», в 1870 повесть «Вечный муж», написанная в духе комедий Мольера, а в 1877 рассказ «Сон смешного человека», в пророческих мотивах которого усматриваются отголоски идей «больших» романов писателя. В 1881 году скончался от туберкулёза и эмфиземы лёгких.	author_dostoevski.jpg	\N	\N	Москва	«Надо любить жизнь больше, чем смысл жизни»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPAAkDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAP/xAAkEAACAQIDCQAAAAAAAAAAAAACAwEAEQQhkQUTFDFRUmJxof/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwB8bZwptNIsGCHK88p9UbiB740oakOwxOmwsU3OB8r5fL1bdu6DpFBf/9k=
22	Лев Толстой	Родился в Ясной Поляне Тульской губернии. После смерти родителей переехал к тёте в Казань. Учился в Императорском Казанском университете, но в 1847 году оставил учёбу, не получив высшего образования. В 1851 году отправился служить на Кавказ. Именно здесь написал своё первое произведение — повесть «Детство», которая была опубликована в журнале «Современник» в 1852 году. Через два года опубликована вторая повесть трилогии — «Отрочество», через три года последняя — «Юность». В 1857 году вернулся в Ясную Поляну, где позднее основал школу для крестьянских детей. В 1862 году женился на Софье Берс. В период счастливой семейной жизни начал писать роман «Война и мир» , который завершил в 1869 году. В 1877 году закончил «Анну Каренину». С конца 70-х годов XIX века стал нередко мучиться неразрешимыми вопросами — последовал период духовного и нравственного поиска. Умер в 1910 году от воспаления лёгких.	author_tolstoy.jpg	\N	\N	\N	«Исполняй всё то, что ты определил быть исполненному»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIDBv/EACAQAAIBBAEFAAAAAAAAAAAAAAECEQADBCEFEhNCUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwA3+axjfZVcqqgyxGiZputjsb+1ns4HFyYtqghjuJJPvdVt3b3bWDqB5mogj//Z
27	Александр Куприн	В 1871 году после смерти мужа мать Александра Куприна переехала с сыном в Москву. Он учился во Второй Московской военной гимназии и Александровском военном училище. Четыре года служил офицером. В 1889 году вышел первый рассказ Куприна — «Последний дебют». В 1898 году издали повесть «Олеся». В 1905 году опубликовали повесть «Поединок», в 1911 — «Гранатовый браслет», в 1915 — «Яма». Александр Куприн участвовал в Первой мировой войне. После Октябрьской революции 1917 года он не принял политику большевизма. В октябре 1919 года поступил в Северо-Западную армию белых и антибольшевиков, был редактором армейской газеты «Приневский край». В 1920 году переехал в Париж, где написал романы «Юнкера» и «Жанета». В 1937 году по приглашению правительства Куприн вернулся в СССР. В 1938 году умер от рака пищевода.	author_kuprin.jpg	\N	\N	Наровчат	«Бог или природа, — я уж не знаю, кто, — дав человеку почти божеский ум, выдумали в то же время для него две мучительные ловушки: неизвестность будущего и незабвенность, невозвратность прошедшего».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgMF/8QAIBAAAgEEAQUAAAAAAAAAAAAAAQIDAAQRMSEFEkJxwf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwClj1Wae5RzFMEiGThjr0PtJBfQFQS4BxonVDrS1a2u1hlckSjKlGI4xo1qxwsI1HevAHgDQf/Z
25	Яна Жемойтелите	Окончила Петрозаводский государственный университет по специальности «Финский и русский языки и литература», затем аспирантуру того же университета по специальности «Эстетика», а также получила первую ступень Московского Института Гештальт-Терапии и Консультирования. Работала преподавателем финского языка, переводчиком, заместителем директора Государственного Национального театра Республики Карелия, главным редактором журнала «Север», кинологом — исключительно из любви к собакам. Сейчас работает библиотекарем в Национальной библиотеке Республики Карелия — из любви к читателям. Председатель Союза молодых писателей Карелии, директор издательства «Северное сияние». Была членом Союза писателей России — исключили за вольномыслие. В 2017 году приняли в «ПЕН-клуб», прекративший существование в 2023 году. Автор нескольких книг прозы и сборника стихов. Лауреат литературных премий: в 2013 году премии И. П. Белкина в номинации «Барышня-крестьянка» за повесть «Недалеко от рая»; в 2021 году премии имени Людмилы Пачепской (за лучшую публикацию года в журнале «Урал») за роман «Кровь дракона». В 2023 году в лонг-лист премии «Гипертекст» вошёл роман «Солнце дышит холодом».	author_zhemoytelite.png	\N	\N	Петрозаводск	«Вот мы, тёмные люди, сидим у себя на болотах и размышляем, что, должно быть, для того, чтобы создать что-то действительно достойное, надо прежде ещё над собой потрудиться, переворошить всё внутри и расставить по полочкам. А это муторно, часто гадко и болезненно, совесть ещё не дай бог встрепенётся, забытая в дальнем уголке»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPAAgDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIF/8QAHhAAAgEFAAMAAAAAAAAAAAAAAQIDAAQFERITMVH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDKhtlyFhsL1LGoVR1reqVOOlGLufNKnUZQkKD99UqTa//Z
33	Андрей Платонов	Писатель, поэт, публицист, журналист. В 1918 году Андрей Платонович начал заниматься литературной деятельностью. В годы Гражданской войны и Великой Отечественной войны работал фронтовым корреспондентом. В 1921 году окончил электротехническое отделение Воронежского железнодорожного техникума. В 1923–1926 годы Андрей Платонович работал инженером-мелиоратором и специалистом по электрификации сельского хозяйства. В 1926 году он вместе с женой и сыном переехал в Москву. В 1927–1930 годы Андрей Платонович написал повесть «Котлован» и роман «Чевенгур», но эти произведения были опубликованы уже после его смерти. В 1931 году повесть «Впрок» вызвала критику И. В. Сталина, так как, по его мнению, цель произведения состояла в развенчании колхозного движения. В 30–40-е годы Андрей Платонович написал несколько пьес, киносценариев и сборников рассказов. В 1951 году скончался от туберкулёза.	author_platonov.jpeg	\N	\N	Воронеж	«Всё возможно — и удаётся всё, но главное — сеять души в людях».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAwQFB//EACEQAAIBAwMFAAAAAAAAAAAAAAECAwAEERIhYQYxQVKh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/UFxJFNE8ErCTWqqA+AN/I55q5qB3x8rLw7MDlidR3ye9MrdXAUATygAe5oU//9k=
26	Саша Карин	Родился на окраине Москвы в 1992 году. Ушёл с филфака, чтобы стать рок-звездой. Проводил эксперименты с расширением сознания, сменил с десяток подработок (от курьера и грузчика до предпринимателя; от журналиста и сценариста до добровольца для клинических исследований). Пожил аскетом в Можайском лесу, вдоволь накатался на автозаке, написал бестселлер в жанре young adult. После тяжёлого расставания с девушкой сжёг ей дверь в квартиру и написал автобиографический роман «В ярости и под солью». В настоящий момент живёт в питерской коммуне. Крадёт еду в супермаркетах, бегает от коллекторов, грабит секонд-хенды и планирует написать новую книгу.	author_karin.jpg	\N	\N	Москва	Искусство — это когда горишь изнутри	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAIF/8QAHxAAAQMDBQAAAAAAAAAAAAAAAQACAwQREgUhMWFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AD19UyMRtyHYtvZY7pmZH1TqExfICeWtFkDJB//Z
28	Марк Мусиенко	Креативный продюсер и сценарист мультфильмов. Победитель конкурса «Литературные резиденции». Имеет два высших образования: экономическое и педагогическое. Записал с учениками начальной школы аудиосказку. Учился во Франции по программе «Ученик по обмену». Профессионально занимался театром. Объездил на машине пол-России.	author_mark.jpg	\N	\N	Москва	«Важно не потерять в себе ребёнка, только он может сохранить настоящую любовь к жизни, остальное — дешёвый заменитель».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAZEAADAAMAAAAAAAAAAAAAAAAAERMCMWH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AINlklsV4AUf/9k=
18	Сергей Иннер	Родился ночью, когда был страшный ураган, в Таганроге. В 2011 году переехал в Санкт-Петербург. Однажды кому-то сказал, что молчание — золото, и понял, что лучше было молчать. Основатель группы «Сверхновая Зеландия». Психоделически исчез 8 мая 2019 года, после презентации антиромана «Овердрайв» . Видеокурс «Проза» Сергея Иннера	author_inner.jpg	\N	\N	Санкт-Петербург	«Порой куда важнее того, что ты делаешь, то, чего ты не делаешь»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAOAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgQG/8QAHRAAAQQCAwAAAAAAAAAAAAAAAQACERIEIQNRgf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AM9iN4zj5Fy21RWRvxSwkHFrXVgTo9oItf/Z
30	Джек Керуак	Американский писатель, поэт, важнейший представитель литературы бит-поколения. Керуак создал технику «спонтанной прозы», завещав творить «как хочешь бездонно со дна ума». Автор романов «В дороге», «Подземные», «Бродяги Дхармы», а также «Саги о Дулуозе», которую составляют романы «Доктор Сакс», «Мэгги Кэссиди», «Видения Жерара», «Тристесса», «Ангелы Опустошения», «Биг Сур», «Тщета Дулуоза».\n\nАндрей Щетников | г. Новосибирск 25.01.1963 Физик по базовому образованию, исследователь движений и состояний человеческого ума по роду занятий. Переводил учёные трактаты с древнегреческого и староитальянского, поэзию и прозу с английского, испанского, украинского, польского языков.	author_keruak.jpg	\N	\N	Лоуэлл	«В этом мире жить невозможно, но больше негде».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAjEAACAgEBCQEAAAAAAAAAAAABAwIhABMEBRESIzFBYnGR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABURAQEAAAAAAAAAAAAAAAAAAAAS/9oADAMBAAIRAxEAPwAidkc3d7J8qQY8ZG7vx9yBrxFFVj2xy2s0WdSX6ckmySe+CX//2Q==
16	Марина Глазачева	Криминальный журналист. Окончила Санкт-Петербургский университет кино и телевидения по специальности «тележурналист, режиссёр ТВ-программ». Публиковалась в литжурнале Русского Динозавра, журнале «Новая Литература» и сборнике грязного реализма по итогам первого международного конкурса имени Чарльза Буковски. Выпускница литературных курсов института имени Горького.	author-glazacheva.jpg	\N	\N	Санкт-Петербург	«Есть ли на свете хоть один человек, которому плевать, на какую сторону он вывернут — на изнаночную или лицевую? Которому скажи: я знаю про тебя всё — а он тебе ответит: ну и прекрасно, ну и знай себе дальше».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAHAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAHhAAAgIBBQEAAAAAAAAAAAAAAREAAgUDBBIhMXH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABgRAAMBAQAAAAAAAAAAAAAAAAABAhEx/9oADAMBAAIRAxEAPwDRpZcnJ221RdVCfLrxkqWOSuygSPsRJqmuBmn/2Q==
2	Олег Новокщёнов	Александр Киреев | г. Москва 19|06|1977 Художник, графический дизайнер, иллюстратор, автор комиксов. Основатель лейбла sketches from moscow. Не считает литератур	author_novokschenov.jpg	\N	\N	Воронеж	«Существуют десятки, даже сотни причин того, почему то или иное событие свершилось, но и сотни контрпричин, в соответствии с которыми оно никак не могло произойти. Взвешивание исторических сюжетов на беспристрастных весах искусства — один из лейтмотивов книги. Познать и объяснить никогда не существовавшее — что может быть грандиознее?» Олег Новокщёнов | г. Воронеж 27|07|1979 Олег Новокщёнов родился в семье высокопоставленных торговых работников, ставших жертвами андроповско-горбачёвского произвола. Детская обида толкнула юношу в объятия процветавшего в Воронеже панк-движения. Олег был вокалистом и автором текстов группы «Уклонение». Так, с криками «Панки, Хой!» он поступил на истфак Воронежского госуниверситета (1996). Изучал советскую экономику и писал манерные декадентские стихи. После выпуска устроился слесарем в ТСЖ и начал осваивать прозу. В 2006 году сменил фуфайку на костюм телеведущего областного ТВ. С 2010 по 2015 погрузился в политику в качестве райтера. «Наевшись» политическим театром, перешёл в детский и стал худруком театра «Котёнок с улицы Лизюкова». Писал тенденциозные статьи и преподавал шахматы. Издательством Чтиво были выпущены и другие романы автора. Сейчас Олег работает над созданием фантастического романа о политической истории XXII века. Контакты: Почта «В конце концов, не так важно, что представлял собой тот или иной исторический персонаж. Перекроив историю, взломав её эвристический код средствами литературы, мы заново декомпозируем сюжет, обогащая его собственными смыслами. Пожалуй, никогда раньше исторический процесс не заказывали на дом в бумажном пакете с надписью "Осторожно, хрупкое!"»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQMEBv/EAB8QAAICAgEFAAAAAAAAAAAAAAECAAQDETEhIjJxkf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwA3LtVbqK1wLrW1Ddo559ygNjYArkQg9QQwmIy+fyMksNf/2Q==
8	Борис Майнаев	Родился в Фергане (Узбекская ССР) в семье врача-офицера. Первый роман начал писать в одиннадцать лет, первый рассказ опубликовал в десятом классе. После школы добровольно пошёл в армию. Историк, педагог, журналист. Состоит в Союзе русских писателей Германии и международном союзе журналистов Literat. Публиковался в России (сборники «Тигр в стоге сена», «Атаман. Исторические новеллы» и «Шёпот ночи», рассказы в литжурнале Русского Динозавра ), Германии (роман «Прыжок снежного барса, или На пути в рай», сборник повестей «На острие судьбы», публикации в журнале «Литературный европеец») и Киргизской ССР (сборники фантастических повестей и рассказов «Падающая звезда», «Два лица Луны», «Театр призраков»). С 1995 года живёт в Германии. Женат, есть дети.	author_boris.jpg	\N	\N	Саарбрюккен	«Жизнь имеет смысл только тогда, когда ты занят тем, что тебе интересно»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAANAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgEF/8QAHxABAAICAgIDAAAAAAAAAAAAAQIDABEEIQUSMUFj/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwAQ5RZQ3SgSI2ER1p1pwNlC71Z3+bmjxuFRVUEIGl9tPYPx0ZJeNrZL7zO/rRgh1//Z
12	Николай Гоголь	Русский писатель украинского происхождения, прозаик, драматург и критик. Учился в Нежинской гимназии, а в 1828 году переехал в Петербург, где начал служить мелким чиновником и одновременно пробовал себя в литературе. В 1831–1832 годах вышла его первая книга, принёсшая ему широкую известность, — «Вечера на хуторе близ Диканьки». Затем были опубликованы сборники «Миргород» и «Арабески». В 1836 году вышла сатирическая комедия «Ревизор», вызвавшая большой общественный резонанс. С 1836 года Гоголь жил главным образом за границей, работая над своим главным произведением — поэмой «Мёртвые души», первый том которой был издан в 1842 году. Позднее писатель переживал глубокий духовный кризис и уничтожил почти готовую вторую часть поэмы. В 1847 году вышел его публицистический сборник «Выбранные места из переписки с друзьями». Умер 4 марта 1852 года в Москве.	gogol.webp	\N	\N	\N	«Как ни глупы слова дурака, а иногда бывают они достаточны, чтобы смутить умного человека»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAEF/8QAIRAAAQIEBwAAAAAAAAAAAAAAAQACAwQTURESMjNBcaH/xAAVAQEBAAAAAAAAAAAAAAAAAAABA//EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDDgulxLRmxMa4cMrrDkK0zf1EO4UpmhvSmY//Z
13	Оганес Мартиросян	Родился и живёт в Саратове. В 2006 году окончил СГУ им. Н. Г. Чернышевского по специальности «Философия». Учился в аспирантуре в СГТУ им. Ю. А. Гагарина. Публиковался в журналах «Нева», «Волга», «Юность», «Воздух», «День и ночь» и других, а также в литературных альманахах. Автор романов «Кубок войны и танца» (Чтиво, 2019), «Небо Мадагаскар» («Эксмо», 2021), «Достоевские дни» (Чтиво, 2022), сборника стихов «Поезд Москва — Нью-Йорк» («Кубик», 2020) и других книг. Участник поэтических и драматургических конкурсов, среди которых «Поэтех», «Турнир поэтов», «Любимовка», «Евразия», «Молодые люди». Трижды лауреат премии «Золотое перо Руси» (2021–2023) и международной премии «В начале было слово» (2024). Стихи переведены на армянский язык.	author_martirosyan.jpg	\N	\N	Саратов	«Достичь бессмертия сейчас»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAHAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQF/8QAHBAAAgICAwAAAAAAAAAAAAAAAQIAEQMSBCFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDDTm5MmR7soU11JuvZMWFnqIlBf//Z
20	Артём Северский	Прозаик, драматург, выпускник Екатеринбургского государственного театрального института. Имеет публикации в литжурнале Русского Динозавра , журнале «Урал», в коллективных сборниках пьес, сборниках рассказов издательства «Перископ-Волга», журнале «Пролиткульт» и других. В 2019 году в Чтиве вышел роман Артёма «Мы кому-то нужны» , в 2022-м — сборник рассказов «Воскресные призраки» .	author_severskyi.jpg	\N	\N	Екатеринбург	«Когда все другие средства исчерпаны, выручит литература»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAUG/8QAJBAAAgECAwkAAAAAAAAAAAAAAQIDAAQREjEFBhQiUVJxkaH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwAV9a3URjnjlwjJAVR9x9VW4KOspcbTuHDR5+QnMB2+KbHvE6xqGjLMAAWLanrpTgr/2Q==
24	Георгий Панкратов	Родился в Санкт-Петербурге. Вырос и учился в Севастополе. Автор пяти книг прозы и одной документальной. Его произведения публикуют в журналах «Знамя», «Новый мир», «Дружба народов» и других. Участник длинного списка премии «Большая книга» (2020, 2022 гг.). Победитель Первой Всероссийской литературной мастерской АСПИР с повестью «Дебют: Как НЕ стать писателем».	author_ponkratov.jpg	\N	\N	Санкт-Петербург	«Это вообще наше, русское счастье такое: только достигнув пределов отчаяния, человек может стать счастливым. Счастье — это очищение и ничто другое: когда свет белый был не мил, так что выть, лезть на стену хотелось, когда было больно, нестерпимо больно, и вот наконец отпустило»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAANAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAEDBv/EACAQAAIABgIDAAAAAAAAAAAAAAECAAMEERITIUFRYWL/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABcRAAMBAAAAAAAAAAAAAAAAAAABERP/2gAMAwEAAhEDEQA/AKprFO97hl7B4HcLb5jL7phVlzfFzdhkbE+4BUzgLCY4A+ojMW6f/9k=
4	Дмитрий Горшечников	Единственный из соавторов имеет филологическое образование. В течение последних 15 лет занимается исследованиями в области языкознания, которые отказывается предавать гласности. Автор десятков неопубликованных рукописей. Тяготея к эстетике Бунина, преклоняется перед Маяковским. Живя в деревне, проповедует урбанизм, хотя в городе известен как луддит. Воинствующий клерикал и при этом скептик. Отличается эпатажным поведением — бунтарь и ниспровергатель авторитетов. Ведёт скрытный образ жизни, не поддерживает сетевые, электронные и мобильные контакты.	author_gorschechnikov.jpg	\N	\N	Воронеж	«Эта книга — как дом со множеством дверей. Можно распахнуть их все, а можно не открыть ни одной. Найти подходящую дверь, войти в неё, узнать, что же за ней — настоящее искушение. Мы не раскрываем чью-то тайну (о, это было бы слишком просто!), мы рассказываем, как сотворить свою»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAP/xAAhEAACAgECBwAAAAAAAAAAAAABAwACEQQhEzFBUVNikf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAERL/2gAMAwEAAhEDEQA/ADrvpa6RhZwyzkbHc17Y3h8r8y/pgF1qSokAnN+nrJQw9P/Z
23	Михаил Булгаков	Родился в Киеве. По окончании Первой киевской мужской гимназии учился на медицинском факультете Киевского университета. Во время Первой мировой войны помогал организовывать лазарет в Саратове, работал в военных госпиталях, после чего получил назначение в Смоленскую губернию. Там, работая земским врачом, начал писать рассказы, которые позже вошли в цикл «Записки юного врача». Во время гражданской войны в 1919 году был мобилизован как военный врач во Владикавказ, где заболел тифом. Выздоровев, решил сменить специальность и стать писателем. Первым опубликованным произведением Булгакова считается фельетон о судьбе России «Грядущие перспективы» (газета «Грозный», 1919). В 1921 году переехал в Москву и стал сотрудничать как писатель со столичными газетами и журналами, среди которых были «Гудок» (где работал ещё и обработчиком писем), «Рабочий», «Россия». В 1923 году вступил во Всероссийский союз писателей. В 1924 году в альманахе «Недра» была опубликована повесть «Дьяволиада», а в 1925 году — научно-фантастическая повесть «Роковые яйца». Писал пьесы для театров и работал режиссёром-постановщиком. В 1934 году был принят в Союз советских писателей. В 1939 году здоровье Булгакова ухудшилось, обострился гипертонический нефросклероз, писатель начал терять зрение. Умер в 1940 году в Москве. Мировую известность Булгакову принёс роман «Мастер и Маргарита», изданный в 1966 году в журнале «Москва».	author_bulgakov.jpg	\N	\N	Киев	«У каждого возраста — свой "приз жизни". Эти "призы жизни" распределяются по жизненной лестнице — всё растут, приближаясь к вершинной ступени, а от вершины спускаются вниз, постепенно сходя на нет»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAANAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAfEAEAAQQDAAMAAAAAAAAAAAABAgADBBESEyFCUXH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AAZmHxtSyW6kuxho+JrYv7U3ivut0i7k3LkZRmiykyVPfDQUaV2JJOqPj9tEf//Z
1	Ильдар Насибуллин	Учился на факультете авиационного приборостроения Уфимского государственного авиационного технического университета. Пишет поэзию и прозу. Имеет публикации в журналах и интернет-изданиях, среди которых литжурнал Русского Динозавра, «Опустошитель», TextOnly, «Лиterraтура», «Воздух». Автор романа в рассказах «Сновидящий и Снотворящий» (Чтиво, 2023).	author_nasibullin.jpg	\N	\N	Жуковский	«Та деятельность, которую человечество называет искусством, появилась совсем недавно. Её рождение мы, наконец, увидели, когда нейросети научились писать стихи, генерировать изображения и создавать музыкальные композиции. И дело не в том, что ИИ обгоняет человека в качестве и количестве производимых предметов искусства, но в том, что скоро нам с вами придётся гнаться за этими машинами, чтобы произвести хоть что-то заметное на фоне трудов наших нейроколлег. Это настоящий вызов человечеству, который оно само же себе и бросило. Именно это обстоятельство снимает все пропозиции о "конце искусства", "игре в бисер" и прочих постмодернистских концепциях. Выстрел стартового пистолета уже прозвучал, а значит, самое время включаться в эту новую игру самих с собой».	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAHAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAcEAACAgIDAAAAAAAAAAAAAAABAgADESEUMZH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABgRAAIDAAAAAAAAAAAAAAAAAAABAhEh/9oADAMBAAIRAxEAPwCympOW12X2AoGdeSgqueoiHhIuz//Z
3	Александр Киреев	Дмитрий Горшечников | г. Воронеж 06|07|1976 Единственный из соавторов имеет филологическое образование. В течение последних 15 лет занимается исследованиями в области языкознания, которые отказывается предавать гласности. Автор десятков неопубликованных рукописей. Тяготея к эстетике Бунина, преклоняется перед Маяковским. Живя в деревне, проповедует урбанизм, хотя в городе известен как луддит. Воинствующий клерикал и при этом скептик. Отличается эпатажным поведением — бунтарь и ниспровергатель авторитетов. Ведёт скрытный образ жизни, не поддерживает сетевые, электронные и мобильные контакты.	author_kireev.jpg	\N	\N	Москва	«В конце концов, не так важно, что представлял собой тот или иной исторический персонаж. Перекроив историю, взломав её эвристический код средствами литературы, мы заново декомпозируем сюжет, обогащая его собственными смыслами. Пожалуй, никогда раньше исторический процесс не заказывали на дом в бумажном пакете с надписью "Осторожно, хрупкое!"»	f	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwAF/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhJDFDUXHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABcRAAMBAAAAAAAAAAAAAAAAAAABYQL/2gAMAwEAAhEDEQA/ABt7q1jgndGEka4xyRub0P2gF3EQCUfn5VrarHpsmwBerHYY8YrGDHA5NNmguH//2Q==
\.


--
-- Data for Name: Articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Articles" (id, slug, title, author_id, cover_path, cover_blur, excerpt, content_blocks, published_at, created_at, cover_width, cover_height) FROM stdin;
\.


--
-- Data for Name: Titles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Titles" (id, name, slug, cover, description, thesis, demo, trailer, trailer_poster, age_restriction, first_release, is_compilation, is_featured, lit_form, cover_blur, book_photos_blurs, status) FROM stdin;
1	Игра в Маяки	igra-v-mayaki	segamegadrive.png	Недалёкое будущее. g, в прошлом художник-акционист, а в настоящем гик-учёный Лаборатории Параллельных Алгоритмов НИИ «Случайный Лес», решает создать уникальную социальную сеть «Маяки», сервера которой не будут под контролем властей мировых государств. Постепенно всё больше и больше людей оказываются вовлечены в реализацию его задумки. Для управления таким масштабным проектом нужен источник нечеловеческой, почти мистической силы. В его поиск включаются как случайные люди, так и таинственные сильные игроки, готовые бросить вызов создателю Игры. На что пойдёт каждый из них, чтобы победить? И как в этом помогут сновидения? Нить размышлений о будущем человечества, ищущего смысл бытия в виртуальных мирах, проведëт вас по лабиринту метафизической, социальной и политической Игры в Маяки. Автор о книге: «Иногда меня увлекает мысль, что между двумя явлениями, кажущимися абсолютно не сопряжёнными, всегда можно найти нечто общее. Роман "Игра в Маяки" освещает эту идею: люди, никак на первый взгляд не связанные, на поверку оказываются близкими родственниками; объекты виртуального мира в известной онлайн-игре подлежат комбинации, чтобы переродиться в новое, никем ещё не изведанное устройство; сновидение становится частью яви, чем явь подтверждает свою причастность к сновидению. Все эти эффекты неожиданного родства вещей и явлений и есть Игра в Маяки. Как, впрочем, и само это рассуждение об Игре в Маяки».	Во власти алгоритмов	\N	\N	\N	18	2026	f	f	роман	\N	\N	published
35	Абзац	abzac-workshop	abzac-workshop.png	Огромная литературная семья, включающая в себя писателей, читателей, редакторов, корректоров, верстальщиков, издателей, критиков, иллюстраторов и многих других, продолжает существовать несмотря ни на что. Сколько бы ни применяли к ней цензурных кнутов, какими бы ни закармливали пряниками поп-культуры — задушить её пока не удалось никому. А чтобы этого никому не удалось и впредь, мы открываем мастерскую Абзац, призванную объединять любителей литературы и давать им новые знания, навыки, возможности, и, что важнее прочего, — друг друга.	\N	\N	\N	\N	\N	2023	t	f	\N	\N	\N	published
3	На земле Заратуштры	na-zemle-zaratushtry	na-zemle-zaratushtry.jpg	Возвращаться в город детства из-за печальных событий — непросто, даже являясь «взрослой собой». Но что, если возвращаться придётся не только в собственный дом, но и к собственным воспоминаниям? В них — пёстрые рыбы, в них — сады и реки, в них — ушедшее детство; вокруг, в настоящем, — безжизненная пустыня. Героиня отправляется в прошлое, чтобы обрести собственное будущее. Удастся ли ей это? И кем же на самом деле был Заратуштра? Автор о книге: «Одним из источников вдохновения при написании повести послужила катастрофа на Аральском море, которая входит в число самых масштабных экологических проблем Узбекистана по сей день. Так, в произведении главное место действия — вымышленный город в районе Аралкума (пустыни, образовавшейся на месте Аральского моря). Повествование затрагивает два временных отрезка — время до наступления экологической катастрофы и настоящее время, когда Приаралье практически полностью превратилось в пустыню. Моей основной задачей при создании повести было столкнуть две реальности: настоящую, которая представлена в длительных последствиях аральской катастрофы, и вымышленную, мифическую, показанную читателю через отношения духов и богов, живущих в этих краях. Сложно сказать, как именно у меня возникла идея написать эту книгу: с одной стороны, мне хотелось запечатлеть несколько личных историй в вымышленном сеттинге; с другой — показать миру ту часть востока, о которой пока мало где можно узнать. Идеи я собирала отовсюду: так в книге появился знаменитый «Бык» из музея Савицкого в Нукусе, каракалы и степные лисы, красавицы-пери и мальчик по имени Заратуштра. Всё это и часть моей настоящей жизни, и часть того сказочного мира, который я продолжаю создавать в своих работах».	На границе двух миров	\N	\N	\N	12	2024	f	f	повесть	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAgT/xAAiEAABBAECBwAAAAAAAAAAAAABAAIDEUEEEhMhIiQyYWL/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/ABIXQzGEP3EkNdQ53lUB+tAAbIawjEO7k+RY9G1VM1vGf0jyOEIT/9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAP/xAAfEAACAgIBBQAAAAAAAAAAAAABAgMRABIhBBUxVJP/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwA0HSq4C0sjeNeWJxfaYPWh+pxzIoiZgo2IIuuavIZOHX//2Q=="}	published
4	Трое в лодке	troe-v-lodke-ne-schitaya-harona	troe-v-lodke-ne-schitaya-harona.png	Кто-то назовёт Эдуарда интеллектуалом, добрым человеком и хорошим другом. Другие увидят в нём легкомысленного бездаря и выпивоху. Он идёт по жизни без цели, часто не выбирая средств. Может, бес вселился в него? На короткой ноге с сатанистами, да и сборник своих стихов окрестил «Книгой бесов». Иннокентий Харин по кличке Кельт, тот самый, что назовёт беспутного писателя «хорошим другом», сам похож на заблудшую овцу. Никто толком не знает, чем конкретно он занимается и насколько большая тень лежит на его прошлом и предпринимательской деятельности. Скажи мне, кто твой друг, и я скажу, кто ты. Любимая женщина, та самая, что назовёт Эдуарда «добрым человеком», похожа на Мону Лизу. Она юна и прекрасна, но никто не знает, кто она и что ждать от этого чудесного создания. Что объединяет этих людей? Воспоминания, тёплые чувства или просто река времени, уходящая в царство мёртвых? Драки, внезапные смерти и другой хаос на фоне смены времён и власти — под обложкой казуального романа Эдуарда Диа Диникина о российской действительности, где герои не стремятся к подвигам, но пускаются в авантюры.	С плота Лозы в ладью, плывущую по Стиксу нулевых	\N	\N	\N	18	2026	f	f	роман	\N	{"01.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQME/8QAHxAAAQMEAwEAAAAAAAAAAAAAAQIRIQADBCISMUGR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAXEQADAQAAAAAAAAAAAAAAAAAAAiEB/9oADAMBAAIRAxEAPwAhdw2kqJCORSNYYP0K0DHxiJtT6wNH2Nsd1SQqHqhWpzsftCxWlun/2Q==", "02.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAfEAACAQQCAwAAAAAAAAAAAAABAwIABBESITFRkdH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFhEAAwAAAAAAAAAAAAAAAAAAAAIh/9oADAMBAAIRAxEAPwCN012TAm1hoRiMpHgsPyhUokk6+qOOt+yMeIjOAOqajwKFqOsP/9k=", "03.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQME/8QAHxAAAgEEAgMAAAAAAAAAAAAAAQIRAAMhkQQFEiJS/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABgRAAMBAQAAAAAAAAAAAAAAAAABERIh/9oADAMBAAIRAxEAPwAbjuSzKuT6gZiJqpQSZe3usXX3HNzLtukvFfkao3bxjLMrR//Z"}	published
5	Серебро	serebro	serebro.png	Действие романа начинается в&nbspПетербурге 1913 года — в период, когда реальность бурлила предреволюционными процессами, идеи сталкивались с&nbspидеями в словесных баталиях, после претворялись в дела — и&nbspсталкивались уже на улицах. Известные представители Серебряного века, такие как Хлебников, Бурлюк, Брюсов, Белый, Тиняков, Волошин, пьют в&nbspресторанах, читают свои и чужие тексты и выбрасывают рукописи, которые попадают в&nbspруки чекистов и агентов охранки. Поначалу произведение Эдуарда Диникина напоминает историко-литературный роман, но&nbspреальность оказывается двулика: в мире, где&nbspна&nbspглазах простых смертных меняются вековечные устои, на поверхность прорывается обратная сторона. Известный поэт здесь может оказаться вампиром или прорицателем, случайный телефонный звонок — связать друг&nbspс другом людей из разных эпох, а дешёвый медальон — оказаться волшебным&nbspталисманом. Границы между сном и явью, литературой и действительностью, добром и&nbspзлом оказываются зыбкими и проницаемыми в мире магического реализма, в&nbspкотором у&nbspкаждого свой шорох за спиной.	Слово — серебро, молчание — свинец	\N	\N	\N	18	2022	f	f	роман	\N	\N	published
6	Повелитель блох	povelitel-bloh	povelitel-bloh.png	Представьте, что у вас есть оккультный двойник. Вы ходите на работу, готовите ужин, гуляете с близкими и даже не подозреваете, что в тот же момент ваш двойник восседает на троне из цветочных лепестков или сопровождает принцессу стрекоз. Что вы чувствуете? Погрузитесь в эти ощущения, отправившись в фантастическое путешествие вместе с «Повелителем блох». Иронический роман-приключение, где всё оказывается не тем, чем кажется. Ребёнок увидит в нём рождественскую сказку с волшебными героями, подросток ─ хлёсткую сатиру на общество, а взрослый вспомнит, что в жизни всегда есть место чуду. Неожиданные физические и душевные метаморфозы, говорящие насекомые, подставные расследования, воскрешение принцесс ─ в последнем романе Эрнста Т. А. Гофмана.	Чудо исполнилось, мгновение настало	\N	\N	\N	12	2023	f	f	сказочный роман	\N	\N	published
7	Дочь греха	doch-greha	doch-greha.png	Харизматичный и любвеобильный музыкант и поэт, пагубное пристрастие которого меняет в его жизни всё. Ромео и Джульетта времён Великой Отечественной войны. Взволнованный школьник, испытавший первое вожделение. Профессор и аспирантка, одержимые любовью. Плотские утехи, мимолётные романы, дружеские знакомства, житейская мудрость, девчачьи хитрости, остроумные афоризмы героев и отголоски войны. Всё это и не только ждёт вас под одной обложкой трагикомедийной лёгкой прозы Бориса Майнаева о дамских угодниках, жаждущих любви женщинах и их жизненных перипетиях. Автор о книге: «О чём громко и открыто не говорят или говорят, опуская глаза. В этих рассказах и повестях сладкий флирт незаметно перетекает в горечь трагедии. Любовь и ложь… Страсть и стыд… Жизнь и смерть… Что это — бесконечное обретение познания или бессмыслица, границы которой очерчены не нами?»	СЕМЬ МГНОВЕНИЙ СЛАДОСТРАСТИЯ	\N	\N	\N	18	2024	f	f	сборник повестей и рассказов	\N	\N	published
8	Сверхдержава	sverhderzhava	sverhderzhava.jpg	Воин запаса Бедович ищет своё место в мирной жизни: днём продаёт телевизоры, ночами пробует себя в литературе. Всё круто меняется при знакомстве с писателем, фантомасом и основателем издательства Чтиво Сергеем Иннером, который вскоре психоделически исчезает. Бедович вынужден стать его преемником в таинственной арт-конгрегации Русский Динозавр и сладить с хаосом, который тот оставил после себя. Сознание Бедовича, а с ним и явь начинают меняться, люди всё чаще принимают за Иннера его самого. Роман с бывшей любовницей Иннера, сердцеедкой доктором-кардиологом превращается в абьюзивный цикл на стыке жизни, смерти и русской киберпанк-апокалиптики: кровососущие банкиры доводят общество до тотальной нищеты и массового помешательства, мутирующие от царь-вируса полицейские становятся зомби, а массолит бесконтрольно рождает тысячи плохих книг глупых писателей. Или всё это лишь художественное произведение Бедовича? Сможет ли герой спасти себя от нищеты, Чтиво от краха, а страну Россию от печальной участи Карфагена? Решает ли простой человек в своей жизни хоть что-нибудь, и чем он должен пожертвовать, чтобы стать непростым? Узнаем ли мы правду о войне с е■учими монголами? И, наконец, сакральное Бедовичево: «Как устроена страна Россия в частности и мир в целом»? Автор о книге: «Сызмальства я мечтал создать экзистенциальный романтический боевик социальной направленности с элементами бурлескного артхаус-порно-триллера для крестьян, рабочих, феминисток, спортсменов, психологов, бизнес-коучей, депутаток, инстабогинь* и всех, кто не входит в этот перечень. Мечты сбываются!» *Пантеон запрещён на территории страны России	любовь и власть	\N	\N	\N	18	2025	f	f	роман-превосхождение	\N	\N	published
43	Бог его имя	bog-ego-imya	bog-ego-imya.jpg	Анна и Шмуэль знакомы с детства, и Анна верит, что он — тот, чьё имя ангел шепнул ей перед её рождением, что они предназначены друг другу; в то же время Шмуэль влюблён в сестру Анны. Чёрно-белая картина детства, где существуют правильные и неправильные поступки, вечная любовь и нерушимые обязательства, постепенно тает, сменяясь бытом взрослой жизни. Вечной любви нет места в этом мире, волшебство кончается. Или это неправда? «Это история взросления — не человека, а его чувств. История о том, как мы оправдываем выбор, который делаем в жизни», — пишет автор.	Взмах крыла голубя может изменить судьбу	\N	\N	\N	16	2021	f	f	повесть	\N	\N	published
10	МРД6	moguchij-russkij-dinozavr	moguchij-russkij-dinozavr.png	В начале было Чтиво. Затем родился Русский Динозавр. Вместе они плечом к плечу стоят на защите современной малой прозы, публикуя для вас исключительные произведения. Перед вами все номера ежегодника: каждый год двенадцать избранных публикаций, двенадцать авторов под одной обложкой — итог двенадцати месяцев работы литжурнала. Выпуски также включают рассказы победителей конкурса рок-прозы «Гроза» радио Овердрайв. Держись, читатель, ибо Русский Динозавр воистину могуч!	Excelsior!	\N	\N	\N	18	2026	f	f	ежегодник	\N	\N	published
11	Сега Мега Драйв	segamegadrive	segamegadrive.png	От первого тетриса до консолей виртуальной реальности, от первой затяжки за школой до диджитал-проектов федерального масштаба: история медиахудожника и продюсера, культ молодости, видеоигр и темнеющего рок-н-ролла, тусовки в супермаркете, диджитал-арт, скейт-поэзия, необитничество, техномистика, психоделириумный экшен и бешеное диско под тяжёлый рок между Петербургом, Москвой, Нижним Новгородом и родными экзистенциальными просторами индивидуального и коллективного бессознательного, а также работа сантехником в детском саду в паре с опустившейся рок-звездой — чистейшая грязь. Нажмите «старт».	game lover	\N	\N	\N	18	2026	f	f	роман-геймплей	\N	{"01.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABgT/xAAiEAACAAUEAwEAAAAAAAAAAAABAgAEBREhAzE0sRMVQXL/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABYRAQEBAAAAAAAAAAAAAAAAAAABMf/aAAwDAQACEQMRAD8AnrbFqjOqGcWcgkfMC0NZTiaF9/GvUDayo9tNYGWzjeGcrxdH8L1AmbX/2Q==", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAeEAACAQQDAQAAAAAAAAAAAAABAgQAAxExEhMhcv/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAERQf/aAAwDAQACEQMRAD8Akx4llZNtEQMCQSD7sazQHiXObYRR7rymMSs5OJxrVEuk9r/Ro6RVp//Z", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQED/8QAIBAAAQMCBwAAAAAAAAAAAAAAAQACERJRAxMhIjFBYf/EABUBAQEAAAAAAAAAAAAAAAAAAAED/8QAFhEBAQEAAAAAAAAAAAAAAAAAABES/9oADAMBAAIRAxEAPwAM4TSGsooMiZHRW+Qy7R5AU5c6ddpR8m5Qlmv/2Q=="}	published
13	Мурло	murlo	murlo.jpg	Степан Фёдорович Домрачёв, чудной пятидесятилетний слесарь, приезжает в село забрать вещи умершего дяди. Там у него угоняют «Газель», поэтому уехать из села он не может. Он начинает переворачивать жизнь местных жителей с ног на голову, постепенно лишаясь рассудка. Автор о книге: «"Мурло" — книга о девиациях. Персонажи, в сущности, самые обыкновенные русские люди, с трудом контролирующие свои страсти. И страсти эти так сильно завладевают ими, что порой может показаться, замещают их, становятся на их место, обретая болезненную форму. Как будто вырезается трафарет, в который удаётся пролезть только образу, высеченному страстями, но не душе. В фильме Андрея Тарковского "Сталкер" герой говорит: "То, что они называют страстью, на самом деле не душевная энергия, а лишь трение между душой и внешним миром". "Мурло" — это попытка осознать, что есть вещи более тонко организованные и могущие принести не трафаретное, а объёмное, истинное счастье».	Снег, блинчики, усач, истерика	\N	\N	\N	18	2021	f	f	роман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQAC/8QAHhAAAQQCAwEAAAAAAAAAAAAAAQACAxEEIRMjMXH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AGxMfHkx5uYAzHUduqtXaNLXEkk7K2T1P+KHiC//Z", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIF/8QAHxAAAgEEAgMAAAAAAAAAAAAAAQIDAAUSIQQiERSB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/AAs3GgkSISds4wxBOwaCW93WGV4vYk6MV0B418rLZ2WNcWI0Bo1FRTj/2Q==", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAfEAEAAgEEAwEAAAAAAAAAAAABAhEAAwUhUQQTMYH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AJ/iS0YLBDT5YyGNrb3jXaSSvskXz9w84juSIVY/veVVbeXBCr//2Q==", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwb/xAAdEAACAgIDAQAAAAAAAAAAAAABAgARAyESQXHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKI42LOocKTtT9ihNC6vuoKsxyBSTXEav2NA/9k=", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQMG/8QAHhAAAwABBAMAAAAAAAAAAAAAAQIDAAQREiEFUWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8ArTyF42vNuMeLKE9bHsEn7mlQydFYMNmG/WHTjN9WrPNGYJ0SoJxLA//Z"}	published
17	Кокора	kokora	kokora.jpg	Симон — талантливый писатель. Он создаёт заказную попсу под массой имён, понимая, что его личная реальность — бесконечное противоречие. Творческие амбиции заземлены необходимостью писать ради заработка. Он мечтает об успехе, но рутина литературного «негритянства» откладывает его планы на неопределённый срок. В поисках выхода из этого тупика Симон находит загадочную работу, однако в первый же день всё принимает неожиданный оборот — ему выдают странный шлем. Надев его, Симон превращается в муху и попадает в иллюзорный мир. Балансируя между двумя реальностями, он приступает к своей миссии. Но кто он на самом деле? «Кокора» — многослойный роман, где границы действительности порой стёрты. Личностные перипетии соседствуют с невероятными технологическими идеями и сказочными погружениями в странные миры насекомых.	Мысли — это маленькие зелёные человечки. Ты хочешь их воспитать, но у них своё мнение	\N	\N	\N	18	2025	f	f	роман	\N	\N	published
18	Макинтош для близнецов	makintosh-dlya-bliznecov	makintosh-dlya-bliznecov.jpg	Нина стаскивает Сашу в реальную жизнь прямо со сцены. Обе девушки устали от одиночества, но они непохожи: Нина торгует своим телом, а Саша не может продать Шекспира. Держась друг за друга, как за костыли, две невезучие героини постигают в окружающих и в самих себе душевную инвалидность и шаг за шагом учатся жить. Читатель видит мир глазами обеих: переносится флешбэками в их детство и юность, а затем возвращается в неустроенную и искалеченную жизнь. Амплитуда событий колеблется от омерзительного до возвышенного, вместе девушки бунтуют против пошлости, из которой не могут выбраться сами. Будет ли крик об одиночестве и нежелании жить в грязи услышан? Перед вами повесть о счастье и горестях, о вечном и преходящем, о цинизме и инфантильности, о превозможении и тёмных закоулках человеческой души, где так легко потеряться. Автор о книге: «Это история о необычном человеке, который родился в обычном мире, об инвалидности и целлюлите душ и тел, о поиске безусловной любви, о хроническом одиночестве и рецидивирующей жестокости, о падении и неврозах, о проституции. Книга о том, в чём сегодня запуталось полмира, о том, что ниже пояса, и о том, что выше, — тоже! Ещё о диких розах и людях, о сладкой алыче, о Маркесе, о пьяном немце и о белой полосе в небе, которую оставляет самолёт...»	Если ты встретил странного человека — значит, он где-то чудом выжил	\N	\N	\N	18	2025	f	f	повесть	\N	\N	published
15	Кубок войны и танца	kubok-voiny-i-tanca	kubok-voiny-i-tanca.png	О мытарствах литератора в современной России: слово, любовь, смерть, духовные прозрения, соцсети, издательства Москвы, горцы Кавказа, боль и исцеление всего мира и намного больше этого. «Книга эта — любовь, должная вращать целый мир, приводить его в движение согласно своим законам, выращенным в уме», — пишет автор.	Жизнь вопреки всему	\N	\N	\N	18	2019	f	f	Роман	\N	{"01.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgMF/8QAIRAAAgAGAgMBAAAAAAAAAAAAAQIAAwUREiFRcQQjMmH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwClRm1EzGPjzTokYq1utcRvym9SZfWIv3BKtIrVZMlBvYbH7CqXqWoHAgtr/9k=", "02.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQRIQUiEkGS8f/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAh/9oADAMBAAIRAxEAPwBS6SG4jZ7jaKCWZSQUA9ftZprSIsSvIMFJ0DE2aZte/H+T9iZMEneRkaq8xRg4EafIoawy/9k=", "03.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQF/8QAHRAAAgIDAAMAAAAAAAAAAAAAAQIAAxESIQQxUf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8AyHSgeOmmgbhZcdkrrWHbVBjPItAzXaT8hj0IGv/Z", "04.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAAG/8QAIRAAAQQBAwUAAAAAAAAAAAAAAQACAyERBAUSEyJBscH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABURAQEAAAAAAAAAAAAAAAAAAAAx/9oADAMBAAIRAxEAPwAjoRDo4y1of0TyfyGQb+KG8Ei4Wk+UgXBLm+w+lncqQf/Z"}	published
16	Виски сауэр	whiskey-sour	whiskey-sour.png	«Виски сауэр» — инструкция по применению внутрь: Патриков, алкоголя, женского внимания, мужских эмоций, историй в стиле стендап, бесед с бомжами и богачами. Саргис живёт в спальном районе и каждый день оказывается на Патриках как на работе. Разговоры у туалета, за барной стойкой, в чужой квартире, на поле для гольфа, на уличной скамейке. Люди меняются как в калейдоскопе. Тон книги — тон выпившего друга: искренний, грустный, рефлексивный, свой. Градус актуальности и узнаваемости высок, ведь «Виски сауэр» не о вечном, а о хрупком, бытовом, близком. Для тех, кто прислушивается к себе и другим людям, любит хороший рассказ и точность попадания в суть. Тех, кому наскучило «нормальное» и кто хотя бы раз пил алкоголь на последние — просто для того, чтобы остаться собой. Издатели книги не пропагандируют табак, алкоголь, наркотики и насилие, не всегда разделяют увлечения героев и призывают читателей к здоровому образу жизни.	Принимать внутрь	\N	\N	\N	18	2025	f	f	роман	\N	{"01.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwT/xAAeEAACAQQDAQAAAAAAAAAAAAABAgMABAUREiExQf/EABUBAQEAAAAAAAAAAAAAAAAAAAQF/8QAGREAAwEBAQAAAAAAAAAAAAAAAQIRAAME/9oADAMBAAIRAxEAPwBMZnZrmzSVoebhhHIR9H0gVBK4eV3HEBmJ6UVHZMy4YcSRuU70ffKY9HqhdHYmXVPMihbN/9k=", "02.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAeEAACAwABBQAAAAAAAAAAAAABAwACBBEhIjJBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAGBEBAQEBAQAAAAAAAAAAAAAAAQIAAxH/2gAMAwEAAhEDEQA/AICsL8qwxqz3cWA49SZbyP2OGh1sZFnMIHQA2MBC5016uo6ySAb/2Q==", "03.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgIF/8QAIhAAAQIFBAMAAAAAAAAAAAAAAQIDAAQRITEFEhQiMkFx/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAaEQACAgMAAAAAAAAAAAAAAAABAgBBAxET/9oADAMBAAIRAxEAPwC39NdnJNe8U34STX5SCipBxKikutWNPKGGnuL4013V1QSL4NDGW2lJbTYYHqCb5qCtygqDM5DVP//Z", "04.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQT/xAAnEAACAQIDBwUAAAAAAAAAAAABAgMABBESIQUGExQiMkExUWGRof/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAGREAAgMBAAAAAAAAAAAAAAAAAAECAzES/9oADAMBAAIRAxEAPwBUxW95KOHHGIo1Bzoo19gCPFTNsaEsSLhhifTImn5QG7txMrJGs0gTHtDHD6pK6duam6j3t5+aKSjrRTX3iZ//2Q==", "05.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAeEAEBAAICAgMAAAAAAAAAAAABAgQRAAMFEhMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAEDEgIRMf/aAAwDAQACEQMRAD8Ah/B1ZuHE40by/cgiQPbfJd9dxdTQlS6TX08X4uqjLGVl/R1xfYD2WoKrteBar0WKJSJZcP/Z"}	published
2	Архив барона Унгерна	baron	baron.jpg	Важнейший исторический документ тысячелетия, окутанный невиданных масштабов ворохом слухов, легенд и домыслов, считался безвозвратно утерянным. Однако же в окне блеснул надежды луч, когда рука Судьбы донесла до редакции Чтива этот исторический роман-фантасмагорию . В сопроводительном письме было сказано, что авторы не раз предлагали его всевозможным издательствам (как выяснилось позже, на протяжении 15(!) лет), но всё это время череда роковых случайностей и мистических происшествий мешала его публикации. Ознакомившись с текстом, Совет Чтива единогласно решил, что мы просто обязаны восстановить историческую справедливость.	История о самой истории	\N	\N	\N	18	2018	f	f	Роман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABgX/xAAkEAABAgQFBQAAAAAAAAAAAAABAAIDBCEiBRESJHElMlFzsf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8AkTsTez2qKQ4RbRU518p0x1jeEAxAdTmfafqeN7Bwha//2Q==", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAEDBf/EACEQAAIABgEFAAAAAAAAAAAAAAECAAMEERIhBRMxQVFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ACo5fkqatwnSAhY2lycclf4w3eN5GqGRS1OqsRcr1Ro+u0VCg7IBtsX8GHAf/9k=", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQMG/8QAIBAAAgEDBAMAAAAAAAAAAAAAAQIDAAQRBRIWITFx0f/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAYEQACAwAAAAAAAAAAAAAAAAAAAQISUf/aAAwDAQACEQMRAD8AJiN2s6WyOwkZtoRxg5Pul+M6iey9rk+ez8rSGKNyrPGjMDkEqCRV6EkNpaf/2Q==", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgEF/8QAHxAAAgEEAwEBAAAAAAAAAAAAAQIhAAMFEQQSQWGB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABYRAQEBAAAAAAAAAAAAAAAAAAABMf/aAAwDAQACEQMRAD8AmQXL3uC97mItmwNbTqoJmIE1hErudj9FLsy7HG8kFiQQPftFlA6iPKN0o//Z", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAIhAAAgEEAAcBAAAAAAAAAAAAAQMCAAQREhMhMTJDUWFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABYRAQEBAAAAAAAAAAAAAAAAAAABAv/aAAwDAQACEQMRAD8AQZZTuXbyvXMiw+MgRA9dayz3wD2AEkbHBx9qVbJpuIcKcl8x2nFISA2P7Q0cf//Z", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQME/8QAIhAAAgIBAQkAAAAAAAAAAAAAAQIDEQBxBAUTFTEzQUKx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAABAP/aAAwDAQACEQMRAD8A08s2LitcCVfkm/uGT7rUTyBAwUMaF9BeNex1ycncbU4So3//2Q==", "07.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQEE/8QAIRAAAQMDBAMAAAAAAAAAAAAAAQIEEQADBSEyQWESUpH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAAAL/2gAMAwEAAhEDEQA/ALkH7R01fWUWAhdmD5QPcDSKDhHfyl8iSGt+Du3d681hQAUJJHFCjl//2Q==", "08.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAIxAAAgAFAgcAAAAAAAAAAAAAAQIAAwQFERLRExQhMTJysf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AE0s1uB0ctge53gmotNMlRNVVIVXIA1dhmNGm0RTyePM6nyP2FWP/9k=", "09.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQMG/8QAIxAAAgEDBAEFAAAAAAAAAAAAAQIDAAQRBRIhMRMiQVGB8P/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAAQL/2gAMAwEAAhEDEQA/AErrULSbUrmG7jjaOKMqjMucsOSM/uqygS2IBMyg+4xUwT5phk42Nx9UgiLsX0jr4oaOP//Z", "10.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEBf/EAB4QAAICAgIDAAAAAAAAAAAAAAECAAMEEQUxISJB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwA5LOux85a68lkHppB92fM3SdEyd6an0z1ozA9lQTHjqKP/2Q==", "11.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQb/xAAfEAACAgICAwEAAAAAAAAAAAABAgMEADERExIhI3H/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJ+7ea30gEnqTwU6JGNw1IUgjV7kKsqgEFtHj9wSmA0S8gH7LvFZGPY3s7OSX//Z", "12.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAP/xAAlEAABAwIEBwEAAAAAAAAAAAABAgMEABEGISJBBRITFDEyYcH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AXxt2PJZRECUk3FkgeB+UAYcjEAkEX26lBw2edYK9RBsCc8qvKdc7p7Wr3Vv9oL//2Q==", "13.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMF/8QAIRAAAgIBBAIDAAAAAAAAAAAAAQIDBBEAEhMhYXEFMVH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AMWxwzNBBQDcqrtI+w/nPjSh8HEwDbHOe8r0D61Cuqxx0XRQrmwo3AYOPei3bVgXbAE8oAkbref3RKv/2Q==", "14.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAIG/8QAIRAAAgEDAwUAAAAAAAAAAAAAAQIDABESBAVBExQhI4L/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AysOll1eXRjLFEyIUXuBzU9seZIh9Una3dJJcGZfUR4NqHQf/2Q==", "15.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgME/8QAHhAAAgICAgMAAAAAAAAAAAAAAQIAAxETBCESU5L/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAEQD/2gAMAwEAAhEDEQA/ACdarps8mCuCMKV7MkVIOCDFltFL8OpmqRm1L2VGZi0VepPkQsxv/9k="}	published
21	Посейдень	poseiden	poseiden.jpg	Похождения современного автора в поисках издания, выпивки, женщин и смысла жизни, путешествия автостопом по России, Европе и Грузии. Истории, рок-н-ролл, бесконечность, странствия в пространстве и сознании, парикмахерские, фракталы и звёздная грязь. Прыжок в неизвестность без парашюта, акваланга и цианида в петлице. Держись, читатель!	Рок-н-ролл, бесконечность и звёздная грязь	\N	\N	\N	18	2017	f	f	Роман в рассказах и повестях	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgMF/8QAIhAAAgAEBgMAAAAAAAAAAAAAAQIAAwQRBQYSIVFhEyJB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL19fVjG5VJSM0vUQPZLq9zud/gHHcIC8oEjyLt3GRm9imDHSStmFrG0CldyoJZiSOYD/9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIG/8QAHhAAAgICAgMAAAAAAAAAAAAAARICEQADBSETFFH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AG1z5We9/eiCZFdRIFi+hVZpoCSRdWruvuTHTqt/HBybZReNhH//2Q==", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIEBf/EAB4QAAIBAwUAAAAAAAAAAAAAAAEDAAIEEgUxQcHw/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ANzT7di11ueCGuOx4HupZhHpAwEMQ//Z", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwX/xAAfEAABBAICAwAAAAAAAAAAAAABAAIDIQQRIjFBUXH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AvT5DsaFrYwJMuY8Wnoez8CohtDYvzpFGBR1Y6TIP/9k=", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwb/xAAdEAACAgMAAwAAAAAAAAAAAAABAgMEABEhBjFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwBLty9V8jijaV2r7DoijjKeEaHvXcrAgI2MFI0MgkKKXUEBtdA+4+Ef/9k="}	published
23	Времяпадение	vremyapadenie	vremyapadenie.jpg	Дизайнер в поисках вдохновения погружается в симуляцию чужих воспоминаний, стирая границы между своей жизнью и жизнью незнакомки. Отец-одиночка становится оператором тактического дрона, но война, в которой он участвует ради сына, забирает куда больше, чем может вернуть. Решив сообщить дочери о разводе, родители сталкиваются с пугающей правдой: в её жизни их место уже заняла безупречно заботливая машина. В мире, где антропоморфных андроидов преследуют как врагов человечества, семья укрывает беглую девочку-синта, не подозревая, что эта тайна изменит их жизнь навсегда. Десять историй о людях и технологиях, разрушенных городах и надеждах, реальности, подчас неотличимой ото сна — наступает эпоха Времяпадения. Автор о книге: «Все истории этого сборника так или иначе рассказывают о времени и попытках человека противостоять его разрушительной работе. Время — самая страшная и могущественная сила мироздания. Его нельзя приручить, умилостивить, подкупить. Ему безразличны человеческие устремления, сокровенные мечты или боль. Время — убийца, но оно и созидатель. Без времени нет жизни, как нет её и без умирания и распада. Самой нашей вселенной не существовало бы без времени. Оно помогает нам понять себя и трезво оценивать свои поступки и место в обществе, развиваться и крепнуть. Но научиться жить в согласии с ним нелегко. Герои моих историй решают эту проблему по-разному, часто ценой невероятных потерь. Готовых ответов нет — есть только время».	ЗАТИШЬЕ ОБМАНЧИВО, БЕЗОПАСНОСТЬ — МИФ, НАДЕЖДА — РОСКОШЬ	\N	\N	\N	16	2024	f	f	сборник рассказов	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAIF/8QAHxAAAQQCAgMAAAAAAAAAAAAAAQACBCEDEQUxQXHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMeIOPEbMJbcpkaJxOaa3qgR7RgaHxHbYvwpPaD/2Q==", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAgX/xAAkEAACAQMCBgMAAAAAAAAAAAABAgMABREEIQYSIjFBQqGx8P/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwAyam221nVIi85JKyphgTn9kUTeLvnp0kTL4IjO/wA0OGY0bnLIpIO2R2qjOAJ5MD2P3Qf/2Q==", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAL/xAAdEAEAAgIDAQEAAAAAAAAAAAABAgMAEQQhMUGR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwB3K5lVNxx7CUZ2A1z+LvzJSO3sxdkSdciQSA32bwDE34fmUf/Z"}	published
26	Вихрь жизни	vihr-zhizni	vihr-zhizni.jpg	Грешник, оказавшийся во власти тьмы, но способен ли он на раскаяние?.. Распутный пьяница, решивший дать своей жене свободу и шанс на любовь с другим, но какой ценой?.. Господа-самодуры и горничная, решившая их одурачить, но удастся ли ей исхитриться и остаться безнаказанной?.. Прелюбодеяние и ревность, душегубство и угрызения совести. Любовь и ненависть, отчаяние и смелость, судьбы людей и бездушная судебная система. Надменность и праздность, смекалка и надежда на лучшую жизнь, увлечение спиритизмом и земельные вопросы. Две драмы «Власть тьмы» и «Живой труп», а также комедия интриги «Плоды просвещения» Льва Толстого, которые породила сама жизнь.	Удивительна слабость человеческая!	\N	\N	\N	12	2024	f	f	сборник пьес	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAfEAEAAQQBBQAAAAAAAAAAAAABAgADBBEhFCIxQZH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAEx/9oADAMBAAIRAxEAPwCLixUn4JmgmO/VKjj47EZZFwlrk6d4aHZBvAgjrils5be5+0NNr//Z", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwT/xAAhEAEAAQMCBwAAAAAAAAAAAAABAwACEQQTEiExUpGh0f/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8AmJrzEPLbtRwnT40DHIKcHu2gmU1WBwYHFHuSd93mgyk6z//Z"}	published
27	Призрачные истории	prizrachnye-istorii	prizrachnye-istorii.jpg	Ужасающе реалистичный сборник произведений, в которых Булгаков-мистик и Булгаков-сатирик вплетает инфернальные мотивы и абсурдистские штрихи в нелёгкую жизнь советского человека. Будьте бдительны: читая эту книгу, вы столкнётесь с дьявольской силой бюрократической машины, станете свидетелем безумного эксперимента и участником спиритического сеанса, встретите покойников и побываете на мероприятии, где происходит чёрт-те что. И вы думаете, что это всё?.. В сборник вошли повести «Дьяволиада», «Роковые яйца», рассказы «Тайна несгораемого шкафа», «Спиритический сеанс», «№ 13. — Дом Эльпит-Рабкоммуна», «Сверхъестественный мальчик», «Как он сошёл с ума», «Как школа провалилась в преисподнюю», «Приключения покойника», «Чертовщина», «Когда мёртвые встают из гробов», «Мёртвые ходят», «Охотники за черепами» и «Сапоги-невидимки». Издание дополняет предисловие Галины Дербиной о мистике в жизни и творчестве Михаила Булгакова. Галина Дербина — автор-исследователь романа «Мастер и Маргарита», булгаковские шарады которой регулярно публикуются в литжурнале Русского Динозавра .	Побеждали лучшие и сильные. И эти лучшие были ужасны	\N	\N	\N	12	2024	f	f	сборник прозы	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAfEAEAAQQBBQAAAAAAAAAAAAABAgADBBFxEhMhIpH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AJsMsMbHsdmN3UZKqiccUWORbIg9W9VTlCMm0SiIHgTmhsIbfWPyiLa//9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAID/8QAIRAAAgIBAgcAAAAAAAAAAAAAAQIDEQAEMQUSIVFhYoH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/ACT65g8EBRZAu/f55x68RAUBioYDqOU5lp40M9lFJrevY5AFgXgOv//Z"}	published
29	Amystis	amystis	amystis.jpg	Смутное время. Двум молодым полководцам поручено спасение Москвы от осаждающего её Тушинского вора. Все победы одержаны, враги повержены, и остаётся сделать последний шаг, но герои внезапно замирают перед решающим выбором: а что, если его не делать? Что, если предпочесть подвигам и славе эстетическое созерцание и гомерический абсурдизм?	Не доволен окружающим миром — есть другие	\N	\N	\N	18	2019	f	f	роман-анализ	\N	{"00.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQT/xAAeEAACAgICAwAAAAAAAAAAAAABEQIDAAQhYSNBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAGBEAAwEBAAAAAAAAAAAAAAAAAAERAiH/2gAMAwEAAhEDEQA/ACdE111SMbvJKYifSisVF2qAAd6LHTwSyIZKDXzoZKSWeck3coc6f//Z", "01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIF/8QAHhAAAAYDAQEAAAAAAAAAAAAAAAECAwQREiExIsH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8AyW48dTKcSI1er+AksR8Stpd1vomNtOwp9MBb3BZR/9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAX/xAAgEAABBAIBBQAAAAAAAAAAAAABAAIDEQQSIQVRYnGB/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABURAQEAAAAAAAAAAAAAAAAAAAEA/9oADAMBAAIRAxEAPwCZk9JjjhY9sj2tLQQTR1Pahz9QBjzgVQNeQTdW0TqL9IhJs8oVlC//2Q==", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQID/8QAIxAAAQQBAgcBAAAAAAAAAAAAAQIDBBEAEiEGFDFBQkRxk//EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQAhMf/aAAwDAQACEQMRAD8AuIwiSWlSpDimXRbTN0j4a674ryMQeqx+YwjhUkwVWb0umr7bZk7LkB1YEh2tR8zkzCT2/9k=", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwX/xAAfEAABBAICAwAAAAAAAAAAAAABAAIDEQQFIVEUMWH/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKGXrociWN4e+GYCjJEaJH3tB4GzHDdm0gergFqizlz77SqC/9k=", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwX/xAAdEAABBQADAQAAAAAAAAAAAAABAAIDBBExQWFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCLXpUpaRlknDDmEZrg7zxSi3CRznYSu+I1R//Z", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwX/xAAcEAABBQEBAQAAAAAAAAAAAAABAAIDBBEhMTL/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwCXVpVZKAmmnhiDgWkH60KKW4SM8TvORc51CqtH/9k="}	published
30	Пупсики	pupsiki	pupsiki.jpg	С началом войны шеф-редактор Бедович меняет уют двухкомнатной квартиры на коммунальную реальность и увлекается сожительством с прекрасными юными созданиями из разных городов и общественных страт. В условиях неосознанной подверженности глобальным изменениям общественного сознания, начинаясь как безобидная игра, сюжет выходит на уровень психоэстетического хоррора с элементами вынужденного социокультурного исследования. Узнай, много ли пупсиков вокруг тебя и как любовь к ним может стать фатальной — чти сиквел романа-превосхождения «Сверхдержава» шеф-редактора Чтива.	Без зла ты в опасности	\N	\N	\N	18	2024	f	f	повесть	\N	\N	published
32	Лежу	leshu-neubitiy-zhivoy	leshu-neubitiy-zhivoy.png	Кто пишет на фронте, да ещё и о любви? Студенты Литинститута имени Горького, оказавшиеся на Советско-финской войне — кто случайно, кто намеренно. Среди снегов, в карельских лесах искусство по-прежнему остаётся главной частью их жизни. Они ищут и находят рифмы, читают стихи в полный голос холодному зимнему небу, но жернова истории норовят перемолоть всех без исключения: Бориса Заходера, Арона Копштейна, Колю Отраду и многих других. Итог сражений хранит прошлое, итог судеб поэтов — повесть Яны Жемойтелите. Автор о книге: «Два года назад на одном библиотечном мероприятии я услышала о студентах литинститута, которые отправились добровольцами на Финскую войну. Они были просто поэтами, мальчишками, которых захватила романтическая идея подвига во имя Родины. Их гибель представилась мне до того несправедливой, что мне захотелось каким-то образом изменить прошлое, как бы странно это не звучало. Однако литература даёт нам такую возможность — воссоздать давно отшумевшие события, на некоторое время воскресить мёртвых. Ведь когда мы погружаемся в историю их жизни и смерти, они какое-то время дышат вместе с нами, а значит, живут. Потери Красной Армии во время Советско-финской войны составили почти триста девяносто две тысячи человек из одного миллиона принимавших участие в боевых действиях. Кем были эти люди? Как они попали на войну? За что сражались и как погибли? И почему мы никак не выучим эти горькие уроки истории — вот о чём хотелось мне рассказать».	НА ФРОНТЕ ГРОМКО ПЕТЬ ВОСПРЕЩЕНО	\N	\N	\N	18	2024	f	f	повесть	\N	\N	published
34	Я есть Россия	i-est-rossia	i-est-rossia.png	«Я есть Россия» — творческий эксперимент, попытка создать Россию на художественной основе. В апреле-июле 2023 года Чтиво провело онлайн-событие, посвящённое роману-ритуалу «россия» Андрея Янкуса. Мы собрали материалы о России, окружающей читателей. Результатом конкурса стал сборник, в который вошли присланные ими фото, стихотворения и размышления. Название выбрано путём народного голосования в соцсетях издательства.	Один раз увидеть	\N	\N	\N	18	2023	t	f	сборник материалов	\N	\N	published
36	Под солью	v-yarosti-i-pod-solyu	v-yarosti-i-pod-solyu.jpg	Разочарованный романтик отправляется в болезненный трип по ночной Москве — в побеге от друзей-наркоманов и от самого себя. Нервное повествование чередуется флешбэками-воспоминаниями: о передозах знакомых, побегах от полиции, путешествиях по России, а также — злобными рассуждениями об отношениях, одиночестве, борьбе с зависимостями, богемной среде, современном искусстве, войне и литературе. Автор о книге: «"В ярости и под солью" — маленький злой роман, посвящённый самым стигматизированным порокам поколения миллениалов. Когда я писал этот текст, то повторял себе основную идею: "Это должен быть нежный удар читателю по лицу! Только честно: об одиночестве и химической ярости. Не книга, а пугающий визг на окраине"». Издательство «Чтиво» и автор произведения предупреждают, что употребление наркотических веществ влечёт за собой негативные последствия для здоровья. Распространение и хранение психотропных препаратов запрещено законом. Психологическую поддержку при борьбе с зависимостью можно получить бесплатно по телефону 8 800 302 - 73 - 76 в АНО «Нонарко».	Мы копаем общую яму	\N	\N	\N	18	2023	f	f	роман	\N	\N	published
37	Пляска смерти Председателя Томского	predsetatel-tomskiy	predsetatel-tomskiy.jpg	1928 год. СССР готовит отправку атомных звездолётов к Сатурну. Ведутся секретные работы по созданию сверхчеловека, способного покорять космические просторы. Руководит проектом Председатель советских профсоюзов М. П. Томский. Однако проект сталкивается с трудностями: Томский кончает жизнь самоубийством. Расследуя его деятельность, чекисты обнаруживают машину по переселению душ. Судьбы героев оказываются тесно связаны с судьбой машины. Побеждая c её помощью смерть, они открывают нечто большее — возможность счастливо прожить свою жизнь.	Историю творят отчаянные	\N	\N	\N	18	2023	f	f	роман	\N	\N	published
39	Олеся	olesya	olesya.png	По долгу службы молодой барин, Иван Тимофеевич, приезжает в глухую деревню на окраине Полесья. Там он влюбляется в Олесю — внучку ведьмы. Казалось бы, им не суждено быть вместе, общество не примет их, ведь по поверьям девушка-колдунья принадлежит дьяволу. Однако не всегда то, что представляется нам злом, является таковым и наоборот; и тот, кто считает недобрым другого, сам может скрывать свою безжалостность. Издание дополняют словарные и реальные комментарии, а также предисловие, в котором рассматривается историко-географический контекст повести. Каждую страницу книги сопровождают иммерсивные цветные иллюстрации.	От лености сердца до трефовой любви	\N	\N	\N	12	2023	f	f	повесть	\N	\N	published
40	Невидимый друг	nevidimyi-drug	nevidimyi-drug.jpg	Элю мучают ночные кошмары, где девочку преследует таинственный монстр. Но всё меняется, когда Эля находит в лесу портал в сказочный мир Виль-Мажин. Там она встречает того самого монстра, на которого объявила охоту Красная королева, правительница Виль-Мажина. Новые друзья Эли — говорящий кот Бумер и ожившая машина Победа — готовы помочь ей остановить безумства Красной королевы и спасти монстра. Медлить нельзя, ведь через три дня портал закроется, и Эля рискует остаться в сказочной стране на всю жизнь. Удастся ли ей восстановить мир в Виль-Мажине и вернуться домой живой?	Каждый из нас обладает огромной силой, нужно лишь её найти	\N	\N	\N	6	2023	f	f	повесть	\N	\N	published
41	Глас земли	glas-zemli	glas-zemli.png	Древнее пророчество гласит, что нога, отделённая от тела, но наделённая самосознанием и мощной политической интуицией, ступит на землю и оставит глубокий след. И тот, кто минует сорок врат и на исходе дня склонится, чтобы обратить свой взор к отпечатку ступни на сырой земле, узрит доселе невиданное: сказавшую первое слово обезьяну и вырванное левреткой генеральское сердце, великого диктатора на деревянных протезах и вывернутого наизнанку лебедя, современного поэта в экстазе вдохновения и зубы крестьянина на горле ядовитого змия, старца в младенческой колыбели и светоносного ангела в стакане чёрного чая, философствующий кочан капусты и неисчислимые полчища плотоядных жужелиц, а за всем этим — нечто такое, что от начала времён сокрыто многослойной завесой непостижимости, но приемлет в себя каждого, кто бежит от него прочь: самое счастливое, сильное и справедливое государство на планете, дарующее страждущему человечеству священную науку скорби, смирения и сострадания.	Фланирование над&nbsp;оскаленной бездной	\N	\N	\N	18	2023	f	f	сборник прозы	\N	\N	published
38	Локал	local_press	local_press.jpg	Команда журнала рассказывает о людях и сообществах, ‌формирующих новую культуру. ‌local — это место, где таланты ‌в области ‌фотографии, журналистики, ‌литературы, музыки и не только ‌могут открыто ‌рассказывать ‌истории, ‌экспериментировать ‌и делиться идеями. ‌ ‌‌Команда журнала верит в силу локальных сообществ ‌как точки возрождения русского ‌самосознания и самоуважения.	печатный журнал о новой культуре	\N	\N	\N	18	2023	t	f	журнал	\N	\N	published
42	Доктор Сакс	doctor-sax	doctor-sax.png	Воспоминания мальчика Джеки о похождениях с друзьями, гремящие бейсбольные матчи, беззаботные игры, которые он устраивает для себя самого, возводят безопасный мир детства. Однако сны Джеки, порой страшные, и мысли о потустороннем воплощаются в готическо-апокалиптическую фантазию: в таинственном Замке живут вампиры, гномы и колдуны, а Доктор Сакс борется со Змеем, олицетворяющим Мировое Зло. Сможет ли Доктор Сакс победить и провести грань между светом и тьмой? Джек Керуак написал «Доктора Сакса» в 1952 году, когда жил в Мехико в гостях у Уильяма Берроуза. По легенде, автор под воздействием наркотиков печатал свой роман на машинке в туалете, потому что другого места для работы не было. Эта легенда хорошо вписывает роман Керуака в контркультурную историю битников. При этом в романе вы обнаружите барочное по форме и автобиографическое в своей основе повествование о четырнадцатилетнем Джеке Дулуозе, о его родном Лоуэлле, семье, друзьях, детских и подростковых фантазиях, страхе смерти и его преодолении. Читатель при знакомстве с творчеством Керуака обращает внимание прежде всего на романы «В дороге» и «Бродяги Дхармы», упуская из виду, пожалуй, самую искреннюю, ритмичную и пророческую книгу автора — «Доктор Сакс». История о битве с Тьмой и спустя семьдесят лет после создания напоминает нам о необходимости посмотреть внутрь себя и столкнуться с личными страхами, чтобы победить змеев, угрожающих извне, и сохранить ценность человеческой жизни во времена, когда она становится наиболее&nbsp;хрупкой.	Вселенная исторгает собственное зло	\N	\N	\N	18	2023	f	f	роман	\N	\N	published
44	Россия	rossia	rossia.png	Он просыпается среди ночи, потому что понимает: в квартире кто-то есть! Садится и начинает печатать на печальной машинке: «Я заперт в своей квартире, потому что до смерти боюсь собственного дерьма». А снаружи — зверь с ужасным оскалом, гопники и менты, ывли и — сплошная&nbsp;россия. Но рано или поздно ему придётся выйти в неё и стать корреспондентом, чтобы свидетельствовать: россия — это не Россия. В россии сосуществуют Создатель и Разрушитель, практик и теоретик, Вова, Володя, Владимир и Вован, агенты каждый день получают сводки в ларьках «Роспечать» и пьют воду-из-под-крана, которая поддерживает всеобщую непрерывную дремоту. Древний алгоритм В.О.В.А. заставляет Колесо вертеться, снова и снова разделяя всех на этих и тех, и только избранные умеют находить&nbsp;щели. При чтении возможны побочные эффекты: привыкание, головокружение, бессонница, паранойя, обострение шизофрении, суицидальные мысли, паническая боязнь собственного&nbsp;дерьма. Автор о книге: «Ритуал — это порядок обрядовых действий. Ритуал совершается там, где человеку нужно повлиять на действительность, сделать так, чтобы в бытии что-то стало, остановилось. Она ведь течёт, перекатывается, эта действительность, и если в ней удаётся поймать просветы счастья, понимания, знания — они тут же улетучиваются, растворяются в потоке. Ритуал — это форма, призванная поймать их и оставить при себе, сконструировать человеческое. „россия“ — это роман-ритуал, и история его создания — это история попыток остановиться, замереть и&nbsp;видеть. Конечно, это не остросоциальная, не политическая книга. Но бытие, как ни крути, исторично. Оно предстаёт перед нами в конкретных формах, и задача — не витать за их пределами, в чистых эмпиреях, а найти всё самое важное здесь и сейчас, во всей этой суматохе&nbsp;дней. И ещё. Перед прочтением книги я рекомендую начисто забыть, что есть граница между внутренним миром и внешним. Всё&nbsp;едино».	россия должна быть сплошной!	\N	\N	\N	18	2023	f	f	роман-ритуал	\N	\N	published
46	Колми	kolmi-press	kolmi-press.jpg	КОЛМИ — это печатное СМИ, ивент-агентство и лейбл, представляющий художественные интересы передовых деятелей российского искусства. Сверхгазета бесплатно распространяется в самых козырных местах необъятной: если ты урвал экземпляр, то считай, что прожил квартал не&nbsp;зря. КОЛМИ создаёт команда петербургских самозванцев, выдающих себя за самопровозглашенцев, выдающих себя за деятелей культуры и искусств, да так правдоподобно, что настоящие их деятели и иные корифеи то и дело появляются в материалах газеты, в которую твои потомки завернут свою порцию&nbsp;скумбрии.	печатное издание нового времени	\N	\N	\N	18	2023	f	f	сверхгазета	\N	\N	published
47	Котлован	kotlovan	kotlovan.jpg	Рабочего Вощева увольняют с завода за слабосильность и задумчивость. Придя в другой город, он присоединяется к артели, которая роет котлован. На этом месте должен появиться общепролетарский дом. В проект здания постоянно вносят изменения, и котлован становится только шире и глубже. А рабочие, строящие светлое будущее, обречены на страдания. Повесть Андрея Платонова, написанная в 1930 году, похожа на антиутопию — только не о будущем, а о настоящем советских людей: в ней воспроизводятся страшные события и реалии коллективизации. Однако «Котлован» — ещё и философское произведение. Рабочие словно находятся в пространстве между жизнью и смертью, чувствуют безысходность — то ли от своей работы, то ли от своего существования. Главный герой Вощев — правдоискатель, отчаянно пытающийся найти смысл «природной жизни» и выпадающий из среды народных масс. Именно он задаёт «вечные» вопросы об истине и счастье. Издание дополняют карточки с портретами и характеристиками персонажей, а также исторические комментарии с фотоматериалами.	Работая над веществом жизни	\N	\N	\N	16	2022	f	f	повесть	\N	\N	published
48	А где же Слава?	slava	slava.png	Коммуналка, хрущёвка, Кремль и Вавилонская башня. Проза, поэзия и любовь. Люмпены, ветеран Афганской войны, принцесса, Достоевский и даже самая развитая во всей галактике форма жизни. Синдром чужой руки, миф о кесаревом сечении, инструкция по созданию голема и жуткий подарок Аполлона. Автор о книге: «Очень часто мне доводилось слышать, что я странный человек: не так думаю, не так шучу, невпопад смеюсь. Когда работал над этим сборником, вдруг понял: в нём, в его художественном пространстве, я чувствую себя абсолютно свободным, могу рассказывать, что угодно и как угодно. Эти истории подарили свободу мне, и я бы очень хотел, чтобы подарили её и читателям».	От Москвы до Рязани, от любви до каббалы	\N	\N	\N	18	2022	f	f	сборник прозы	\N	\N	published
49	Двойник	dostoevski-dvoinik	dostoevski-dvoinik.png	Яков Петрович Голядкин — робкий, одинокий, обидчивый титулярный советник, чувствующий презрение своих коллег и желающий любви и уважения. Однажды он приезжает к статскому советнику Олсуфию Ивановичу Берендееву на бал в честь дня рождения его дочери Клары Олсуфьевны — возлюбленной Голядкина. Однако героя выдворяют. В минуты отчаяния он встречает своего двойника, который становится его врагом. В повести «Двойник», написанной в 1846 году, Фёдор Достоевский словно ведёт диалог с Николаем Гоголем. Художественный мир «Петербургской поэмы» связан с художественным миром гоголевской петербургской повести «Записки сумасшедшего»: в ней так же, как и в «Двойнике», затрагиваются тема борьбы бедного и богатого чиновников за сердце дочери начальника и тема безумия. Голядкин не только «маленький человек» — этот тип героя хорошо показан в другой повести Гоголя «Шинель», — но и человек, низведённый чиновничьим обществом до состояния «ветошки», впрочем, «ветошки», имеющей амбиции. Двойник Голядкина — это жуткий образ, рождённый отчуждённостью, нереализованными амбициями главного героя, разрушающий его жизнь и похищающий его личность. Динамично, фантасмагорично, трагично — именно так можно описать эту повесть.	Сходство разительное, обстоятельство странное, комедия пасквильная	\N	\N	\N	16	2022	f	f	повесть	\N	\N	published
50	Пожниночь	pozhninoch	pozhninoch.png	Рассказы, не вошедшие в сборник «Посейдень» , с которого началось издательство Чтиво, а также стихотворения, переводы и последние ночные посты Сергея Иннера — специальный проект Чтива к трёхлетию психоделического исчезновения автора. Вновь истории, рок-н-ролл, бесконечность, странствия в пространстве и сознании, а также Эрос, Танатос, агенты ФСБ, величайший торговец в истории, сама Литература, явившаяся в бар в облике соблазнительной красотки, и единственная причина отказаться от ночи с двумя раскрепощёнными девушками — держись, читатель!	Жизнь, любовь да нейросети	\N	\N	\N	18	2022	f	f	сборник рассказов	\N	\N	published
51	Достоевские дни	dostoevskie_dni	dostoevskie_dni.jpg	Писатель Фёдор Достоевский ест, спит, живёт и пишет великие книги. Найдёныш ищет друга, но не просто друга, а на всю жизнь. События разворачиваются в едином временном поле, где запросто соседствуют Достоевский, избранный автором в качестве своего альтер эго, Иван Тургенев, Юрий Трифонов, Борис Рыжий и — современность, в которой действует, если говорить словами Маяковского, «мастерская человечьих воскрешений».	Поэзия, доставленная в город на Неве	\N	\N	\N	18	2022	f	f	роман	\N	\N	published
53	Мир цвета сепии	sepiya	sepiya.jpg	Ленинградский художник Дмитрий Дьяконов тяжело переживает смерть родителей. Его также тяготят творческие неудачи и запутанные отношения с девушкой Аней, которую завлекли в эзотерическую общину. Тревожит его и набирающий силу кризис в стране — завершающий этап «перестройки». Ко всем бедам Дьяконова прибавляется основанное на оговоре обвинение в убийстве. Избежав ареста, он отправляется в глубинку, на поиски общины. Жизнь в роли беглого преступника заставляет его многое переосмыслить и взглянуть на мир по-новому.	Понять себя, чтобы не застрять на перепутье	\N	\N	\N	18	2022	f	f	роман	\N	\N	published
52	Проститутки на обочине	prostitutes	prostitutes.jpg	Когда перевод этой книги попал к нам в редакцию, мы приняли его за очередную имитацию (хотя и довольно качественную) стиля Буковски, Хемингуэя, парижской прозы Генри Миллера etc. В сети почти не нашлось информации, которая подтверждала бы существование заявленного автора. Однако, копнув глубже, мы убедились, что Эрих фон Нефф действительно существует, имеет публикации в США и Европе, недавно ему исполнилось 80 лет, и он вышел на пенсию, а до тех пор работал докером в порту Окленда (Калифорния). Тогда-то мы взглянули на книгу совсем другими глазами. Действие рассказов происходит на прибрежных шоссе и в борделях Калифорнии и Техаса, в берлинском варьете, в флорентийском театре. Это истории о странных встречах и мимолётных отношениях, в которые вступает герой, странствуя по миру. Книга впервые издана в 1999 году на французском языке под названием ‘Prostitutees au Bord de La Route’ (издательство Сahiers de Nuit). Мы рады представить вам её первое русскоязычное издание.	Записки докера из Калифорнии	\N	\N	\N	18	2019	f	f	Сборник рассказов	\N	{"1.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAQQF/8QAHRAAAgMAAgMAAAAAAAAAAAAAAQIAAzERIUJhcf/EABUBAQEAAAAAAAAAAAAAAAAAAAEF/8QAGBEBAAMBAAAAAAAAAAAAAAAAAQACAxL/2gAMAwEAAhEDEQA/AMSitHVWe8U89KSpOfIC9wNB98bBAC2eMqGQZXxpYV6n/9k=", "2.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAQMF/8QAIhAAAQMCBgMAAAAAAAAAAAAAAgABAxEhBBIiMjNBkbHB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAT/xAAYEQACAwAAAAAAAAAAAAAAAAAAERITYf/aAAwDAQACEQMRAD8AwY4RMczYiKMmbaTvX0hxu+kfCB4693+KaFsq9Z//2Q==", "3.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQIE/8QAJxAAAgEBAw0AAAAAAAAAAAAAAQMCAAQhcQUREhMVIiMxMkJRUoH/xAAVAQEBAAAAAAAAAAAAAAAAAAACBP/EABcRAAMBAAAAAAAAAAAAAAAAAAACEQH/2gAMAwEAAhEDEQA/ABrXYYotLIF8FyGaQgQScKnZ7/SI+1qdvZdjpX3jnhRT3N17OJPqPcfNGli1cP/Z", "4.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQME/8QAHRABAAICAwEBAAAAAAAAAAAAAQIDBBEAEkEhMf/EABUBAQEAAAAAAAAAAAAAAAAAAAED/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAERAv/aAAwDAQACEQMRAD8A14xWdMWVRKMaSSp8d684fbVgxtmOBrUk115LIusCSWTE2D2fzgbkXKrbYr72eFpRZP/Z", "5.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABP/EAB8QAAICAgEFAAAAAAAAAAAAAAECAxEAMQQSEyFScf/EABUBAQEAAAAAAAAAAAAAAAAAAAID/8QAFxEAAwEAAAAAAAAAAAAAAAAAABESQf/aAAwDAQACEQMRAD8AZw42LsrxRiDtr0Uoo+Bf3ATwlZ5AkaBQxAAUavDISOMlHQFYZppAxqR9+xwU8KwtP//Z"}	published
54	Воскресные призраки	prizraki	prizraki.jpg	Ирина, Дина и Марк — волонтёры, которые регулярно посещают хоспис с умирающими детьми, чтобы искупить боль, которую причиняли другим. Лариса мечтает сбежать от матери и её ухажёров, а её одноклассница Лиза смертельно больна. Муж Светланы избивает и жену, и дочь, и те сбегают от него в лес, прямо в лапы другого, настоящего зверя. Глеб подрабатывает таксистом, когда его нанимает Зара — солистка музыкальной группы; он находит в девушке новую жизнь и решает рассказать ей о своих секретах. В сборнике представлено двенадцать историй об одиночестве и чувстве вины, прощении и ненависти, травмах и поиске лекарства от неутихающей боли. О том, что какими бы путями ни шли герои, в конце они всё равно остаются наедине со своей совестью. И этот финальный диалог — самое тяжёлое испытание из возможных. Больше никаких иллюзий. Один на один.	Нельзя убежать от себя и с собой остаться невозможно	\N	\N	\N	18	2022	f	f	сборник рассказов	\N	\N	published
55	Ирокез	irokez	irokez.jpg	Не столь давняя история оживает, и современность играет новыми гранями: Ленин встречается с омоновцами, воспоминания провинциального детства обрываются вместе с жизнью старого пса, любовь рождается на стройплощадке и умирает в студенческой тетради, а преступлением может оказаться не только причёска, но и трезвость. Это рассказы о хрупкости и ценности человеческой жизни, которую люди готовы разменять на пачку купюр или корм для псов. Сердцевина книги — искренняя, напряжённая проза, обострённая чувствительность к тому, мимо чего многие пройдут, не задумываясь.	БЫСТРО И СТРАННО	\N	\N	\N	18	2021	f	f	сборник рассказов	\N	\N	published
56	Крафт	craft	craft.jpg	Две разных судьбы одного и того же человека пересекаются в одном микрорайоне. Офисный сотрудник проводит жизнь в размышлениях о смерти, а порой ему кажется, что он уже мёртв. Группа журналистов отправляется в пресс-тур в загадочный закрытый город; приехав на место, они понимают, что тур заказан только в один конец. Георгий Панкратов мастерски сплетает современные реалии с мирозданческими материями и экзистенциальными ужасами, способными привести в трепет даже самого бывалого читателя. Встречайте новые истории от автора «Российского времени» . Автор о книге: «На какие-то моменты современная литература обращает мало внимания, и хочу, чтобы они были представлены и услышаны. Меня волнуют несправедливость, сложности взаимопонимания между людьми, поиск счастья, который порою приводит их на достаточно странные территории, подталкивает к спорным решениям».	Любовь, смерть и каштаны	\N	\N	\N	18	2021	f	f	сборник повестей	\N	\N	published
58	Белый цветок	white-flower	white-flower.jpg	Способна ли новая философия остановить тайное общество? Подземные реакторы вышли из-под контроля и грозят городу уничтожением. Нити заговора тянутся во дворец губернатора. Африканский посол инкогнито пробирается на священную литургию, но погибает от рук разъярённой толпы. Пассажиры автобуса обнаруживают в карманах записки странного содержания. Напитки отравлены наркотическим ядом. Человеческая кровь изливается в систему отопления. Сможет ли главный герой добраться до истины, прежде чем редкий мистический дар разрушит его сознание?	Жизнь соткана из чудес. Смерть — лишь одно из них	\N	\N	\N	18	2019	f	f	Роман	\N	\N	published
59	Смерти нет	smerti-net	smerti-net.jpg	Жители города пытаются укрыться от жизненных неурядиц на кладбище, где находят работу и кров. Судьба сталкивает здесь скульптора и бездомного, музыканта и убийцу, калеку и чемпиона. Однако по обе стороны кладбищенского забора человек имеет одни и те же слабости и пороки. Ни водка, ни колдовство, ни попытки найти смысл бытия не могут оградить героев от зла. Над ложью, подлостью и жаждой наживы их возвышают лишь любовь и смерть.	Поняв смерть, поймёшь и жизнь	\N	\N	\N	\N	2021	f	f	роман	\N	\N	published
60	Фрида и Гитта	frieda-and-gitta	frieda-and-gitta.jpg	Две отчаянные красотки Фрида и Гитта были участницами французского Сопротивления во время Второй мировой войны, а затем стали инспекторами парижской полиции. Ни время ни пространство не помешают им выследить преступников и заставить злодеев понести заслуженную кару. Слышите звонкий стук каблуков? Это приближается неотвратимое возмездие!	Правосудие на высоких каблуках	\N	\N	\N	18	2020	f	f	сборник прозы	\N	\N	published
61	Люцифер	lucifer	lucifer.jpg	Божий сын, рождённый земной женщиной, сегодня суперзвезда, но — много ли мы знаем о первом сыне Бога, рождённом Светоносной Материей, Великой Матерью Мира — Люцидой?	Несущий свет не станет тьмой	\N	\N	\N	16	2020	f	f	Поэма	\N	\N	published
62	В Дороге	v-doroge	v-doroge.jpg	Один из величайших романов XX века в новом переводе, соответствующем поэтической и ритмической прозе Керуака. Это совершенно не похоже на то, что вы читали раньше, вас ждёт невероятный кайф, великий джаз безумных мастеров бибопа и путешествия через «просторы старой рухнувшей Святой Америки от устья до устья и от края до края». Поехали!	ТЫ НА ПУТИ К НЕБЕСАМ	\N	\N	\N	18	2020	f	f	Роман	\N	\N	published
63	ПРЕПОДРОБНЫЙ. БЫТИЕ СЕРГЕЯ ИННЕРА	prepodrobniy	prepodrobniy.jpg	Попытка собрать воедино все имеющиеся данные о рок-певце, писателе, любовнике, борце за справедливость, психонавте, путешественнике и мыслителе, авторе антиромана «Овердрайв» и основателе издательства «Чтиво», ушедшем от нас слишком рано и неизвестно куда.	ОН УСТАЛ БЫТЬ ПОСЛОМ РОК-Н-РОЛЛА В&nbsp;НЕРИТМИЧНОЙ&nbsp;СТРАНЕ	\N	\N	\N	18	2020	f	f	бытие	\N	\N	published
33	Адвент-календарь Чтива	advent-calendar	advent-calendar.png	Окончание новогодних праздников — не повод отказываться от подарков. Чтобы продвигаться по числам нового месяца было круче и дичайше, Чтиво приготовило для тебя январский адвент-календарь. В закрытом Телеграм-канале каждый день будут появляться новые чумовые сюрпризы. Мы собрали для вас целых тридцать и ещё один подарок. Внутри — десяток свежих цифровых изданий, эксклюзивные материалы от авторов, редакции и радио Овердрайв, курсы, приятные скидки и многое другое.	печатный журнал о новой культуре	\N	\N	\N	\N	2023	t	f	ежегодник	\N	\N	published
64	Мы Кому То Нужны	my-komu-to-nujni	my-komu-to-nujni.jpg	Жители затерянной на краю Земли деревушки во время наводнения оказываются отрезанными от большого мира. Река затапливает дома и подбирается к самому дальнему, где живет Валентина. Ей и деверю Варламу теперь нужно придумать план спасения. Это непросто: идти некуда. А ещё у них на руках тело мужа Валентины, скончавшегося накануне паводка. Один на один со стихией героям приходится найти в себе силы не пасть духом и бороться за то, что ещё осталось.	Конец света на краю Земли	\N	\N	\N	16	2019	f	f	Роман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQAE/8QAHxAAAgIBBAMAAAAAAAAAAAAAAQIDEQAEBSFxEyJR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAXEQEAAwAAAAAAAAAAAAAAAAAAAREh/9oADAMBAAIRAxEAPwDNtGi0s+2NNNFAznyG3BtQoFVz9wsnQ3xLPXa4YGZT6sR0cstkY//Z", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgQF/8QAIBAAAgICAgIDAAAAAAAAAAAAAQIDEQAEBSExMjNRcf/EABUBAQEAAAAAAAAAAAAAAAAAAAAC/8QAFhEAAwAAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwCng43bjNIKsFSh/aOyKs/eGGOkGIMs133RWs2OImkXS0QsjgAPQDHrzhST5G/TlUJw/9k=", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQT/xAAhEAABAwMEAwAAAAAAAAAAAAABAgMEABIhESIjQQVhcf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwBBjVLUVs+OQVOti03I6TqeqFlgiW8DDbHIrFycZ+VUiQ9dA5XMIOm442ijJLrhkukuKJvPfumL/9k="}	published
9	Гомоза	gomoza	gomoza.jpg	Любовь, драки, похороны и философские разговоры на кухне — всё в уральской провинции, которая становится символом малой родины: вернуться непросто, но и окончательно покинуть невозможно. Ностальгия, отношения отцов и детей, разочарования и погружение в прошлое. Застарелые психологические травмы, поиски смысла жизни, детские обиды и мучительное взросление уже состоявшегося человека. Перед вами история душевного освобождения Егора Гомозина, уставшего от долгого и скучного существования. Автор о книге: «Писать этот роман я решил спонтанно. Читая Булгакова, наткнулся на слово "гомоза", которое меня заворожило. Я не знал, что оно означает, но решил, что гомоза — это некая серая булькающая, вроде лавы, субстанция, представляющая собой неизвестную или слабо изученную форму жизни. Мне захотелось узнать об этой жизни побольше, изучить её, раз никому, кроме меня, до неё не было никакого дела».	Время умирать и время воскресать	\N	\N	\N	18	2024	f	f	роман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAQQF/8QAHBABAAIDAAMAAAAAAAAAAAAAAQIRAAMiMZHB/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABURAQEAAAAAAAAAAAAAAAAAABEA/9oADAMBAAIRAxEAPwDHUIxm8Su5HlcVmqmuVOGgE2qXT8yQnKjp94iRjf/Z", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwEF/8QAHxAAAgMAAAcAAAAAAAAAAAAAAQIAAxEEBRMhMUFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAABABH/2gAMAwEAAhEDEQA/AD5rfZXcoSx0TFPYffcQ3jTLxzN1GGnABg2Z5J3zKGExv//Z", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgEF/8QAHRAAAgMAAgMAAAAAAAAAAAAAAQIAAxEEBRQiMf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAWEQEBAQAAAAAAAAAAAAAAAAABABH/2gAMAwEAAhEDEQA/AMvr+R41otSwKw0HfhGRZVylapGNiaVBPsIFMkS7EMv/2Q=="}	published
20	Об пол	ob-pol	ob-pol.jpg	Маус был обычным студентом медицинского вуза, пусть и не подавал особых надежд. Однако автоавария по пути на занятия перечеркнула всю его жизнь, ведь парень лишился ноги из-за тяжёлой травмы. Из глубокой апатии и депрессии его смог вывести лишь Терапевт — загадочный, огромных размеров человек с неожиданными методами работы. Теперь он готов снова выйти в мир, окружающий родной панельный двенадцатиэтажный дом. Однако новым препятствием на его пути внезапно становится сломанный лифт. Поняв, что путь наружу для него закрыт, Маус решает погрузиться в жизни, текущие за дверями разных квартир, ещё не подозревая, к чему это может привести. Готовьтесь к встрече с поэтом-садистом, призраком модного художника, поднебесными бездомными и гильдией жалостливых старух — всё под крышей одного панельного дома.	Трагикомедия в двенадцати этажах	\N	\N	\N	18	2024	f	f	роман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwX/xAAdEAACAgIDAQAAAAAAAAAAAAABAgMRACEEEjFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwCRzJnSVY1ZSldmFXdHeOI4mAYdqOxrJ/K9X5jIx6Ls+YdK/9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQMEBv/EAB8QAQACAQQDAQAAAAAAAAAAAAECEQAEEiFxAwUyQf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAFR/9oADAMBAAIRAxEAPwDPkoSPGIbWhs5u+TGvr4LZJr8wasI6qW0rrKofEesG3FD/2Q==", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgMG/8QAIBAAAgEDBAMAAAAAAAAAAAAAAQIRAAMEBRIhMVFhcf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8AvqObnYmsQb7tZDhktgdjx7rTqQ6hhwCJ57ohFkvtG+I3RzH2lTaH/9k=", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAwQFBv/EACAQAAEEAgEFAAAAAAAAAAAAAAEAAgMRBDEFEkFhgZH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ANG+V78VzsWjJWt/PKGw8l0NsR671aX44kZEjQaAkcAPaqHZVH//2Q==", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgMEBf/EACEQAAEDAwQDAAAAAAAAAAAAAAECAyEABBEFEhMxQUJR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwC5V3qBuy2btttzdhLYbykz5P2t5vmLaeRKAvA3Se6JKEn1EyY7plND/9k="}	published
22	Неслучившееся	unhappened	unhappened.jpg	Ни один из этих рассказов, написанных с 2014 по 2018 год, по словам автора, не был придуман специально — они просто приходили и сами помогали себя написать. И по стилю повествования это заметно: лёгкий слог, плавные сюжетные линии, темпоритм выдержанного арт-хауса. «В жизни так мало сюжета и так много важных мелочей, она так хороша в своей недосказанности» — пишет Даша. «Неслучившееся» случилось в качестве третьей книги Чтива, и мы рады представить вам этот феномен.	Такое бывает раз в никогда	\N	\N	\N	16	2018	f	f	Cборник рассказов	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAH/xAAgEAABBAEEAwAAAAAAAAAAAAABAAIDESEEEhNRIkGR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AG6maaJkJ0rhucY4/PIzZPtK5Hdj4kwNaea2g1I6sdE0rSC//9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEBf/EACAQAAICAgEFAQAAAAAAAAAAAAECAxEABDETFBUhgeH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0NiTZ81JGkxWBIFYpXJJPGVNHOWNTIBfodP9x2qB2oNCyzWfuGB//9k=", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAHRAAAQQCAwAAAAAAAAAAAAAAAQACAzEScREyUf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0Ez8aqijnTyZHaQn7O0VNwPAqD//2Q==", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQT/xAAaEAEAAwEBAQAAAAAAAAAAAAABAAIDMRFB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AHb98+Qfa6bXCyBZjG/JE9Yh/9k=", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQF/8QAIRAAAgAFBAMAAAAAAAAAAAAAAQIAAwQREgUUIXFBUZH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Au3tVI1iZSVbIFZcqey2Dj13GjlfwfkPNRGZWZVLLfEkcjqAgP//Z", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQF/8QAHhAAAgICAgMAAAAAAAAAAAAAAQIAAwQRIUJBcZH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A1HuyaslhciLRsBGHYnx7jbJ6H6JSw4hRD//Z"}	published
45	Овердрайв	overdrive	overdrive.jpg	Антироман рокера, борца за справедливость и психонавта, психоделически исчезнувшего сразу после публикации своего магнум опуса, успел стать культовым ещё в&nbsp;виде цифрового издания. Спустя годы после релиза цифровой версии мир дождался печатного издания. «Овердрайв» — это точка входа в мир, каким он открылся провинциальному юноше, переехавшему в Санкт-Петербург в поисках любви, возможности стать рок-звездой и&nbsp;разгадки тайны Великого Но (но&nbsp;тут, как всегда, начинается Всё Это). О том, как желаемое становится действительным, о зыбкой грани между реальностью и мифом, о&nbsp;великом гитарном баттле Эроса и Танатоса и&nbsp;о&nbsp;том, о чём не говорят вовсе. «Я люблю эту книгу и боюсь её. Её&nbsp;страницы населены всем самым лучшим, самым кошмарным и самым важным, что&nbsp;я&nbsp;сумел отыскать в себе, её текст высечен из камня. Я&nbsp;не&nbsp;представляю, что&nbsp;с&nbsp;вами будет, когда вы её прочитаете», — пишет автор.	Обратная сторона рока	\N	\N	\N	18	2019	f	f	антироман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMG/8QAHhAAAgICAgMAAAAAAAAAAAAAAQIDEQAhBDESIoH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAQD/2gAMAwEAAhEDEQA/AMtC8RiZJFcuSPCjr7kWPsa6vF8bUUtapNYYAV1ikDf/2Q==", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgMEBv/EAB4QAAEEAQUAAAAAAAAAAAAAAAEAAgMRBBMUITFC/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMxCcPaza7XGfxRNKe0LuymAChwg/9k=", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQAC/8QAHRAAAQUAAwEAAAAAAAAAAAAAAQACAwQRBSFRcf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AA6VajLx8ssoIlbuZIBnXiLLm6cYM+lYUi1//9k="}	published
12	Петербургские повести	peterburgskie-povesty	peterburgskie-povesty.png	В Петербурге «всё обман, всё мечта, всё не то, чем кажется». Ночной блеск его главной улицы, Невского проспекта, легко туманит испытующий взгляд, заставляя прохожего свернуть туда, где случай становится судьбой. В одном доме молодого художника преследует образ неизвестного человека, который не желает отпускать, в другом — чиновник-карьерист теряет собственный нос и во что бы то ни стало пытается его вернуть. Влюблённый мелкий дворянин теряет рассудок, о чём свидетельствует тяжёлый плод его страданий — дневник, а бедный титулярный советник видит смысл своей жизни в шинели. Каждая повесть открывает скрытую сторону города — тревожную, таинственную, иногда пугающе правдивую. Мир будто отражён в кривых зеркалах — привычный порядок вещей нарушается, реальность ускользает, непостижимое и безумное обволакивает сознание героев. В сборник вошли повести «Невский проспект», «Нос», «Портрет», «Записки сумасшедшего» и «Шинель».	В тени города, который слышит больше, чем говорит	\N	\N	\N	16	2025	f	f	Сборник повестей	\N	{"1.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQMEBv/EAB0QAAICAQUAAAAAAAAAAAAAAAEDAAIREhMhInH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAC/9oADAMBAAIRAxEAPwDPLYLK3mCttJFcE8mTkpJz3GfIiGLpYMhf/9k=", "2.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwEF/8QAHxAAAgEEAgMAAAAAAAAAAAAAAQIAAxESkQQxITJB/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwDLFCnigVC2XbfBCPGW58HcOkzYdnchZr+x3HoI/9k=", "3.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQF/8QAHhAAAgICAgMAAAAAAAAAAAAAAQIAAwURBCESMVH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwCrnZG+nKJQlgVCyDx0OwT3Ns+4YRTZsqN/dRZbR//Z", "4.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIEBf/EAB0QAAICAQUAAAAAAAAAAAAAAAECABESAxMxUYH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABcRAQADAAAAAAAAAAAAAAAAAAARIUH/2gAMAwEAAhEDEQA/AMFNttNsqysVILPcLuwNBiPYo4lJsMf/2Q=="}	published
25	Город случайностей	gorod-sluchajnostej	gorod-sluchajnostej.jpg	Прежде чем отправиться на прогулку по шести улицам Петербурга Достоевского, усвойте правила выживания. Избегайте резких поворотов. Не ходите за господином с чёрной лентой на шляпе. Не стойте долго у парадных. Не идите в дом на зов музыки, доносящейся из освещённого окна, ведь никогда не знаешь, чем обернётся ваше вторжение. А если покажется, что вы узрели истину, не верьте — вдруг это всего лишь сон. До вас донесутся обрывки разговоров — странных, тайных. Разговоров на грани смеха и слёз. Вас встретят герои случая, поступки которых вы, возможно, поймёте не сразу. Но вчитайтесь и понаблюдайте за ними! Приятной вам прогулки по городу Достоевского — городу случайностей, которые, быть может, не случайны. В сборник вошли рассказы «Честный вор», «Чужая жена и муж под кроватью», «Сон смешного человека», «Скверный анекдот», «Ползунков» и повесть «Вечный муж».	Я не то, что вы думаете	\N	\N	\N	16	2024	f	f	сборник прозы	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAIEBf/EACAQAAIBBAEFAAAAAAAAAAAAAAECEQADBEESISIyQnH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQAC/9oADAMBAAIRAxEAPwDCS89gtb5yB6k9sb6bpmxy7FxcMMZ3QyqckSo8F1VBdgSAxA+0SS5b/9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQT/xAAgEAABAwMFAQAAAAAAAAAAAAABAgMRABIxBBMhQVEi/8QAFAEBAAAAAAAAAAAAAAAAAAAAA//EABcRAQADAAAAAAAAAAAAAAAAAAABITH/2gAMAwEAAhEDEQA/AAG3LkK08Qb5IyT5zSIW5Ahb6R4DiodISL1SbtoCe80e44vcV9qye6KbJj//2Q=="}	published
28	Худшее-2	hudshee-2	hudshee-2.jpg	Время собирать тексты, и время разбрасывать худшие из них. Ассоциация Худших Литераторов тщательно отобрала у вас возможность не узнать о них никогда. В прошлом году мы думали, что хуже быть не может. Как же же-же-жестоко мы ошибались! Ходят слухи, что администраторы паблика проводили над авторами бесчеловечные опыты: били их током, Ожеговым и учебником логики, окунали в случайно разлитый одрерир и даже заставляли общаться с техподдержкой некоего банка. Так тексты подопытных стали эсхатологически ужасны и кристально отвратительны. Все специалисты, причастные к работе над сборником, задавались вопросом: «Почему должны страдать только мы одни?!» Исправляем эту несправедливость — теперь любой желающий может разделить нашу боль. Обретайте, скачивайте, приобщайтесь… Но учтите: если вы любите хорошую поэзию, цените своё время и психическое здоровье — эта книга не для вас. Не читайте её. Побойтесь бога, раз уж авторы — не.	Вдвое худшéе	\N	\N	\N	18	2024	t	f	ещё более худший сборник прозы и поэзии	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQMEBf/EACQQAAIABQMEAwAAAAAAAAAAAAECAAMEESEFEjETIiMyQmGx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJ9OpZa0UypqdpQXwrWKi/6YzmkDcbsq59Spx9QJ3bqjKMKXyBwYXMnzeo/lfk/IwSf/2Q==", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAP/xAAgEAABAwQCAwAAAAAAAAAAAAABAgMRAAQSIQUxMlFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8ALa2jLnDP3CmpcQpyFZxEdaoCSCkErPXqjknJwTrI1RPiPlFWP//Z", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgQG/8QAIBAAAgEDBAMAAAAAAAAAAAAAAQIDAAQRBRIhYSMyUf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA6ZbWUumxSy2yBkzuLH277rOyt5XwSo3HC/OqazSLEFWRwMngManYksSSSc0h//9k="}	published
24	Худшее	hudshee	hudshee.jpg	Годами паблик АХУЛИ (Ассоциация Худших Литераторов) собирал худшие тексты нашего поколения, месяц за месяцем совершенствуя свою худшесть — и теперь, наконец, всё стало так плохо, что на это невозможно смотреть без слёз. Сборник «Худшее» призван довести ситуацию до абсолютной, запредельной, нечеловеческой концентрации худшего из худшего. Составители тщательно отбирали тексты, тестируя их на фокус-группе смертников. Будьте уверены: ни один текст, который своей плохостью не убил хотя бы пару тестировщиков, не вошёл в сборник. Мы искренне рекомендуем поберечь свои нервы и никогда, ни за что не иметь дел с этой книгой. Это может плохо закончиться.	Хуже и быть не может	\N	\N	\N	18	2023	t	f	худший сборник прозы и поэзии	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQb/xAAiEAACAQMCBwAAAAAAAAAAAAABAgMAEiEFEQQUMjNRcpH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJ1bjJY9SmQTONrdvg8VQxuzRqbxkA9IoHWUXmXa0XYztmkoeynqKC//Z", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgMEBv/EABwQAQADAAIDAAAAAAAAAAAAAAEAAhEDEiExof/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDPPHQrbkw6voSRqb4PsK9kUFzImB//2Q==", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIG/8QAGhAAAgMBAQAAAAAAAAAAAAAAAAECESExQf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDJThTis3ekNRv0d9QAH//Z", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAEDBf/EACAQAAIBBAEFAAAAAAAAAAAAAAECAAMREiEEFDFBVKP/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ANkct3rYoisuJa97a8Q6ir6/0EYUKKhAAOIGhJjsJQf/2Q==", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIF/8QAIBABAAEDAwUAAAAAAAAAAAAAAQIAAxESIUEEBSIxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A2o6r8ZQ6q4z0OGJ4icL9qy9GJg2DYChu7dxMcwlmhfbVB//Z", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQMEBf/EAB0QAAICAwADAAAAAAAAAAAAAAEDAhEABBIxccH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Ar3H7enuhjnGSiSFqhG+x6+5oQf1CMilgsXVeMcyIlJdgGiavBiH/2Q=="}	published
14	Сын греха	sin-greha	sin-greha.jpg	Мальчишки, получившие неожиданный подарок судьбы в виде молодой девушки, сталкиваются с суровой реальностью. Преданный своему делу врач, в очередной раз встречаясь со смертью, узнаёт о предательстве жены. Следователь и журналист расследуют убийство и измену, скрытые за соседской дверью, а разведчик, впервые поддавшись искушению плоти, открывает для себя новую грань между жизнью и смертью. Пагубные страсти, треволнения сердца, мучительные переживания, размышления о том, как любовь может сплотить и погубить, и о том, что в трудные моменты стоит бросить вызов судьбе, — в продолжении «Дочери греха» Бориса Майнаева. Автор о книге: «Обретённая реальность или утраченные иллюзии? Глубокий омут или чистота горного воздуха? Пепел обыденности или ослепительной силы огонь? Любовь — болезненное, но неизбежное чувство, способное изменить судьбы. Каждый рассказ погружает читателя в мир, где любовь и предательство переплетаются, от первого поцелуя до глубоких размышлений о грехе».	Десять мгновений сладострастия	\N	\N	\N	18	2025	f	f	сборник рассказов	\N	{"01.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwAF/8QAIhAAAgECBQUAAAAAAAAAAAAAAQIDAAQFESEiQRIjM2Fx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAYEQADAQEAAAAAAAAAAAAAAAABAhEAQf/aAAwDAQACEQMRAD8Aw4baGPCxcM6Syux7PTmVUaZk8UAs0y3SAHnSp/MBwTr7o3O9vpoiTzXKqgRhZv/Z", "02.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAMG/8QAIhAAAgEDBAIDAAAAAAAAAAAAAQIDAAQRBRIhQRMiMWHR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAXEQEBAQEAAAAAAAAAAAAAAAABEQAx/9oADAMBAAIRAxEAPwDLmLwrE0qoQ67h7dfeKctrZ7RuePOOcMf2o6GqyarCjgMpzwRkfFBugFu5gowA7AAdc0OupQLN/9k=", "03.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEBf/EAB4QAAIBBAMBAAAAAAAAAAAAAAECAwAEITEFEROR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAABABH/2gAMAwEAAhEDEQA/AK7/AJOY3csMUhtvGNmycyHsdACtq2lEltE7bZAT8pnmjZZFJGiRqiipdMv/2Q==", "04.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwT/xAAiEAACAQMDBQEAAAAAAAAAAAABAgMABBEhIzEFElFSYeH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwCC7vIpLZMSKGULtAY11yfypBfTgACSIAfBT3Kg9TtlIGCjZHnmhaCLuO0nPqKDbr//2Q==", "05.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwT/xAAjEAACAAUCBwAAAAAAAAAAAAABAgADBBEhEiIkMUFCUWGR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQADAQEAAAAAAAAAAAAAAAAAARECIf/aAAwDAQACEQMRAD8AFncyWnoVXcEIJOsnIPyLElUIRQ1PWMbZYXz7iSnHDzn7gwseog1d9I3Ny8wOF09Spw//2Q==", "06.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgME/8QAIhAAAgICAQMFAAAAAAAAAAAAAQIDEQAEBRITkSExUVJh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAWEQEBAQAAAAAAAAAAAAAAAAABABH/2gAMAwEAAhEDEQA/ABs81sx7DdqZNmBbBSVaNfoPvXzm+HkdZoUZ9WcMVBNOQL84xDE0shMSEkC7UeuU6F+o8YqumX//2Q=="}	published
57	Подземные	podzemnie	podzemnie.jpg	История любви одного из величайших писателей ХХ века к темнокожей девушке, опередившей своё время на несколько десятилетий, разворачивается перед нами в ритме спонтанной прозы на фоне гремящих тусовок бит-поколения в Сан-Франциско пятидесятых.	И ГАСНЕТ СВЕТ	\N	\N	\N	18	2021	f	f	роман	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgMF/8QAIhAAAgICAgAHAAAAAAAAAAAAAQIDEQQSACEFIjFBUXGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8Az8XBbKd54MvZCfMQDtfx+8gc94zpeSuvVMRY++uIGjSPxdtEVbUMaFWb9eDJZHMrkuxJY+/CV//Z", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABAH/xAAbEAACAwADAAAAAAAAAAAAAAAAAQIDETIzcf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AJUk1mCVGvOIePc/EIESv//Z", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAgP/xAAkEAACAQMBCQEAAAAAAAAAAAABAgMABBEFExUhMTNRYYGSwf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AhFqE9tGkhgXZTLhXXnw/e4pb78Z9UrBVfR0DgMBIcAjOKgbeHPSj+RRH/9k=", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIE/8QAHxAAAQQCAgMAAAAAAAAAAAAAAQACESEDEgQTIjGx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABURAQEAAAAAAAAAAAAAAAAAAAEA/9oADAMBAAIRAxEAPwCA5/Rhcxm3sGpWsMaQDpEo+NWGq8z8SyUkgN//2Q==", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAIF/8QAIRAAAQMDBAMAAAAAAAAAAAAAAQACAwQiMRESEyFRYaH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AIlklZUR7Da8WtGD5+rT4x6RaPuEE5DikalKR//Z", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwEE/8QAIBAAAgEEAQUAAAAAAAAAAAAAAQIRAAMEEjEFISIjUv/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8ALNtsFxG3RI2nYCTx2E1Ua6Lag3kkAT5in6kiOcTZVaJiRMcVoTHs6L6rfHyKI//Z", "07.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAID/8QAHhABAQACAgIDAAAAAAAAAAAAAQIAEQMEEhMhQXH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAAH/2gAMAwEAAhEDEQA/AM69hXXuKkmpZfJA2OPJ40Nsj95HXia4I8pHTWtn5ih+MaI//9k="}	published
19	Сновидящий и снотворящий	snovidyashiy-i-snotvorishiy	snovidyashiy-i-snotvorishiy.png	Сон на грани реальности. Реальность, утопающая во снах. В этом романе вы познакомитесь с историями повелителя-предсказателя, блогерши-снотворицы, Архитектора и его снотворящего Великана, Героини, которую преследует зловещая Белая Барышня, и даже группировки похитителей&nbsp;снов. Для романа в рассказах характерна особая темпоральность: сновидческое ускорение времени. Авторская пунктуация будто рассекает пространство повествования на два состояния: бодрствование и сон, жизнь и смерть, играет роль «крючьев», за которые цепляются сознания героя и читателя. Автор о книге: «Каждый рассказ романа появился из тщетной попытки вести дневник сновидений. Люди записывают ночные грёзы по разным причинам, мне же хотелось сохранить картинки ускользающих после пробуждения образов. С переменным успехом мне это удавалось, но через какое-то время появилось стойкое желание дополнить и развить отрывочные сновидческие впечатления. Результатом своей литературно-сновидческой работы я хочу поделиться с читателями, а также пригласить их присоединиться к клубу первых в мире сновидцев-книгочеев».	ОСТАВЬ НАДЕЖДУ, ВСЯКИЙ ЗАСЫПАЮЩИЙ	\N	\N	\N	18	2023	f	f	роман в рассказах	\N	{"01.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQG/8QAHRAAAgIDAAMAAAAAAAAAAAAAAQIAAxESMSFBQv/EABUBAQEAAAAAAAAAAAAAAAAAAAAD/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEh/9oADAMBAAIRAxEAPwDLUpW9RawLv859wC757iNb4KAc1ErVQVBIHJWXB//Z", "02.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAQIEBf/EAB4QAAICAgIDAAAAAAAAAAAAAAECABEDMQRRBRJB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMLxvDTmYHY5WR13oAdWSZExdWI9iaNWNGDH18jwP//Z", "03.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQIE/8QAIBAAAgEEAQUAAAAAAAAAAAAAAQIDAAQFESESEzFSkf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AmzwNjLjbOZ4CXkUFiHI3sUZd4qNLuZI0IRZGCjngboaOR9gdbaHgbrT3ZPdvtUf/2Q==", "04.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABgX/xAAfEAEBAAICAgMBAAAAAAAAAAABAgMRAAUEIRNBUYH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKGXp/GyYM2DH42KPklCgNinpP7wDWNimLEqXSfjx53uS8fXU47qF0bl19cEVVNK0qvt3yj/2Q==", "05.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgMEBv/EACMQAAIBAwMEAwAAAAAAAAAAAAECEQADBAYSMQUTIUJRYXH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AG9Os4mBeNrFAd7iy/udvzMeAeaB8fTHcbe1kNJkK7QD9RUhuOmjLTI7KzNtJBgkTx+Vn6o//9k=", "06.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwEG/8QAGRAAAgMBAAAAAAAAAAAAAAAAAAECEiER/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMxJQcG7OyWaCUTgH//Z", "07.png": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAEDBv/EABwQAAICAwEBAAAAAAAAAAAAAAECABEDEjFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AzeBA61qL+w0A6I8JKhqJF9r2UlH/2Q=="}	published
31	Российское время	rossijskoe-vremja	rossijskoe-vremja.jpg	Свобода, любовь и ревность. Митинги, секты, войны и революции. Завал, ущерб, повышение. Пиво, глинтвейн, отвёртка. Кошка, кошечка и Принцесса. Уэлен, ВДНХ, БДСМ. Ёлки, подарки, снеговики, снежинки. Желание жить в тот самый момент.	Всё будет	\N	\N	\N	18	2019	f	f	Сборник рассказов и повестей	\N	{"01.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQMG/8QAIBAAAgIBAwUAAAAAAAAAAAAAAQIAAxEhMUEEBRJR8f/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECMf/aAAwDAQACEQMRAD8ACW5a7XU2Mp0AC8+8xcJ2MgeW/OpEz1ZJ6tcnPyXyTvJqWCo//9k=", "02.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAEG/8QAIRAAAQIFBQEAAAAAAAAAAAAAAQACBBESITEDIkFRkqH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQACEf/aAAwDAQACEQMRAD8AyohntZUSTxtE/qt+j6SNJ7jABpcaayZTthHOUJteyuAv/9k=", "03.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABQT/xAAiEAACAAYBBQEAAAAAAAAAAAABAgADBBESISIFBhQkMbH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAID/9oADAMBAAIRAxEAPwCfptH5Ur2UeRieMyUtuIH03+7g8vJc5KpIOwTCfZ7tapXI4qFsL6G4MqABUTQBYZn9gNDQ/9k=", "04.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgQFBv/EAB8QAAIBAwUBAAAAAAAAAAAAAAECBAADBQYREhMxIf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAXEQADAQAAAAAAAAAAAAAAAAAAARES/9oADAMBAAIRAxEAPwB2Jjo1thIVWZ3H1mYk1Cvafmd1zrKlOR4kn0b1oseSYa7miPpoRD0z/9k=", "05.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQG/8QAGxAAAwEAAwEAAAAAAAAAAAAAAQIRABIhIjH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMrwQIxcNZ5mCah+qB8Ixaj/2Q==", "06.jpg": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwb/xAAdEAACAgEFAAAAAAAAAAAAAAAAAgMSAREiMkFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCUaOsVnXO7iwOg7+dBFH//2Q=="}	published
\.


--
-- Data for Name: Audiobooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Audiobooks" (id, title_id, price, is_published, publish_date, release_date, duration_seconds, file_size_bytes, file_path, demo_path, discount, sold) FROM stdin;
1	22	100.00	t	2018-01-01	2024-12-12	\N	\N	\N	\N	\N	f
3	43	100.00	t	2021-01-01	2021-01-25	\N	\N	\N	\N	\N	f
2	29	300.00	t	2019-01-01	2019-12-10	\N	\N	\N	amystis/demo.mp3	\N	f
4	58	300.00	t	2019-01-01	2019-04-04	19920	305000000	\N	white-flower/demo.mp3	\N	f
\.


--
-- Data for Name: Workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Workers" (id, name, job, photo_path, city, is_team_member, sort_order) FROM stdin;
1	Анна Соколова	Главный редактор	\N	Санкт-Петербург	t	0
2	Дмитрий Орлов	Арт-директор	\N	Санкт-Петербург	t	1
3	Мария Лебедева	Литературный редактор	\N	Санкт-Петербург	t	2
4	Игорь Беляев	Дизайнер	\N	Санкт-Петербург	t	3
5	Елена Кузнецова	Корректор	\N	Санкт-Петербург	t	4
6	Сергей Морозов	Координатор	\N	Санкт-Петербург	t	5
7	Сергей Иннер	редактор	\N	\N	f	0
8	Александра Яшаркина	верстальщик	\N	\N	f	0
9	Кристина Габеева	художник	\N	\N	f	0
10	Екатерина Яковлева	дизайнер	\N	\N	f	0
11	Серафим Лоза	веб-мастер	\N	\N	f	0
12	Наталья Кислова	редактор	\N	\N	f	0
13	Леон Меликьянц	верстальщик	\N	\N	f	0
14	Евгений Борщевский	иллюстратор	\N	\N	f	0
15	Ниёле Мейлуте	чтец	\N	\N	f	0
16	Anamorphic Orchestra	композитор	\N	\N	f	0
17	Глеб Кашеваров	редактор	\N	\N	f	0
18	Софья Попова	редактор	\N	\N	f	0
19	Катерина Гребенщикова	корректор	\N	\N	f	0
20	художник-иллюстратор Екатерина Кравченко	корректор	\N	\N	f	0
21	Диана Гильманова	верстальщик	\N	\N	f	0
22	Екатерина Кравченко	дизайнер	\N	\N	f	0
23	Илья Черкасов	веб-мастер	\N	\N	f	0
24	Анастасия Лукьянова	веб-мастер	\N	\N	f	0
25	Александра Вакулинская	продюсер	\N	\N	f	0
26	Дарья Драхлер	продюсер	\N	\N	f	0
27	Сергей Дедович	редактор	\N	\N	f	0
28	редактор-корректор Катерина Гребенщикова	редактор	\N	\N	f	0
29	Артём Артамонов	дизайнер	\N	\N	f	0
30	Катерина Видяскина Дата релиза: 12.11.2025	продюсер	\N	\N	f	0
31	Вера Вересиянова	корректор	\N	\N	f	0
32	Ульяна Попова	дизайнер	\N	\N	f	0
33	Маргарита Царева	дизайнер	\N	\N	f	0
34	Диана Гильманова	продюсер	\N	\N	f	0
35	Ася Шарамаева	редактор	\N	\N	f	0
36	Александра Крученкова	корректор	\N	\N	f	0
37	Анастасия Болбат	дизайнер	\N	\N	f	0
38	Анна Волкова	редактор	\N	\N	f	0
39	Анна Мезенцева	корректор	\N	\N	f	0
40	Лена Солнцева	иллюстратор	\N	\N	f	0
41	Алексей Капустяк	верстальщик	\N	\N	f	0
42	Андрей Янкус	продюсер	\N	\N	f	0
43	Анна Черкасова	веб-мастер	\N	\N	f	0
44	Валерия Арсибекова	продюсер	\N	\N	f	0
45	художник-иллюстратор Екатерина Ковалевская	корректор	\N	\N	f	0
46	Анна Толкачёва	продюсер	\N	\N	f	0
47	Анастасия Пергашина	корректор	\N	\N	f	0
48	Анастасия Коренева	продюсер	\N	\N	f	0
49	Александра Яковлева	редактор	\N	\N	f	0
50	Катерина Гребенщикова	редактор	\N	\N	f	0
51	Ксения Шунькина	корректор	\N	\N	f	0
52	Дарья Плешкова	дизайнер	\N	\N	f	0
53	Никита Барков	редактор	\N	\N	f	0
54	Ирина Курако	редактор	\N	\N	f	0
55	Нелли Реук	корректор	\N	\N	f	0
56	Анастасия Давыдова	корректор	\N	\N	f	0
57	Татьяна Максимова	корректор	\N	\N	f	0
58	Анастасия Автухова	корректор	\N	\N	f	0
59	Екатерина Ковалевская	иллюстратор	\N	\N	f	0
60	Кладбище Джо	иллюстратор	\N	\N	f	0
61	Екатерина Апенько	иллюстратор	\N	\N	f	0
62	Анастасия Болбат	иллюстратор	\N	\N	f	0
63	Ольга Осипова	дизайнер	\N	\N	f	0
64	Артём Артамонов	дизайнер	\N	\N	f	0
65	Виктория Юшина	верстальщик	\N	\N	f	0
66	Александра Вакулинская Дата релиза: 15.10.2025	продюсер	\N	\N	f	0
67	Анна Ящук	продюсер	\N	\N	f	0
68	Алёна Завороткина	корректор	\N	\N	f	0
69	Софья Попова	корректор	\N	\N	f	0
70	Екатерина Нуруллина	дизайнер	\N	\N	f	0
71	Алёна Купчинская	редактор	\N	\N	f	0
72	Ксения Харина	иллюстратор	\N	\N	f	0
73	Даниил Румянцев	дизайнер	\N	\N	f	0
74	Артём Артаманов	дизайнер	\N	\N	f	0
75	Майя Пахомова	веб-мастер	\N	\N	f	0
76	Денис Дронов Дата релиза: 22.10.2025	корректор	\N	\N	f	0
77	Денис Дронов	корректор	\N	\N	f	0
78	Наталья Атряхайлова	редактор	\N	\N	f	0
79	Маруся Ванюшина	корректор	\N	\N	f	0
80	Софья Попова	продюсер	\N	\N	f	0
81	Анна Пехова	редактор	\N	\N	f	0
82	Ксения Воробьёва	художник	\N	\N	f	0
83	Катерина Видяскина. Дата релиза: 01.08.2025	продюсер	\N	\N	f	0
84	Лекси Любопытная	верстальщик	\N	\N	f	0
85	Андрей Захарченко	веб-мастер	\N	\N	f	0
86	автор анимации Леон Меликьянц	веб-мастер	\N	\N	f	0
114	Александра Смирнова	верстальщик	\N	\N	f	0
148	Максим Димов	веб-мастер	\N	\N	f	0
178	Анна Пеховой	художник	\N	\N	f	0
87	Катерина Видяскина. Текст буктрейлера читает Макс Сопатов	продюсер	\N	\N	f	0
105	Кристина Габеева	иллюстратор	\N	\N	f	0
133	Андрей Щетников	переводчик	\N	\N	f	0
137	Анастасия Ворожейкина	редактор	\N	\N	f	0
139	голос буктрейлера Ниёле Мейлуте	веб-мастер	\N	\N	f	0
141	Катерина Видяскина	дизайнер	\N	\N	f	0
147	Елизавета darlert Луговская	иллюстратор	\N	\N	f	0
162	Денис Джумаев	корректор	\N	\N	f	0
175	Дмитрий Козлов. переводчик Андрей Щетников	художник	\N	\N	f	0
182	Ксюша Харина	иллюстратор	\N	\N	f	0
88	Анна Кочарян	иллюстратор	\N	\N	f	0
92	Олеся Кирсанова	продюсер	\N	\N	f	0
101	Диана Гильманова. Дата релиза: 25.12.2024	продюсер	\N	\N	f	0
122	автор предисловия Александр Бушковский	веб-мастер	\N	\N	f	0
126	Софа Чернова	дизайнер	\N	\N	f	0
127	Горыныч	иллюстратор	\N	\N	f	0
144	фотограф Мария Немм	иллюстратор	\N	\N	f	0
153	Наталья Псурцева	корректор	\N	\N	f	0
156	Олег Кустов	переводчик	\N	\N	f	0
164	Кристина Цхе	редактор	\N	\N	f	0
166	Мария Давидович	иллюстратор	\N	\N	f	0
167	Елена Горкальцева	редактор	\N	\N	f	0
172	Дарья Букштай	веб-мастер	\N	\N	f	0
176	в буктрейлере использованы видео Алины Кикели	художник	\N	\N	f	0
89	Артем Артамонов	дизайнер	\N	\N	f	0
91	Александра Каменёк	корректор	\N	\N	f	0
119	Дмитрий Козлов	художник	\N	\N	f	0
128	Екатерина Грехова	дизайнер	\N	\N	f	0
145	Диана Гильманова. Фотосессия прошла в студии мес | mmmesss. Дата релиза: 19.01.2023	продюсер	\N	\N	f	0
150	Елена Чмель	иллюстратор	\N	\N	f	0
151	Екатерина Видяскина	дизайнер	\N	\N	f	0
159	Ольга Тамкович	иллюстратор	\N	\N	f	0
173	диктор Максим Сопатов	веб-мастер	\N	\N	f	0
177	Александры Яшаркиной	художник	\N	\N	f	0
90	Олеся Кирсанова Дата релиза: 23.10.2025	продюсер	\N	\N	f	0
94	Татьяна Чикичева	корректор	\N	\N	f	0
96	Диана Гильманова. Дата релиза: 18.03.2025	продюсер	\N	\N	f	0
120	озвучка буктрейлера – Вадим Прохоров	веб-мастер	\N	\N	f	0
125	комментариев Ирма Чальцева и Софья Попова	составитель	\N	\N	f	0
143	автор предисловия Сэм Моргунов	иллюстратор	\N	\N	f	0
146	Дарья Козлова	редактор	\N	\N	f	0
152	Андрей Янкус	редактор	\N	\N	f	0
154	второй редактор Виктория Романова	редактор	\N	\N	f	0
171	актрисы Ниёле Мейлуте	веб-мастер	\N	\N	f	0
181	Александра Яшаркина и Леон Меликьянц	верстальщик	\N	\N	f	0
93	Екатерина Ким	дизайнер	\N	\N	f	0
97	анимации Ксения Енюшина	художник	\N	\N	f	0
103	Нелли Реук и Ксения Шунькина	корректор	\N	\N	f	0
117	Птитсата	иллюстратор	\N	\N	f	0
129	Анастасия Достиева	продюсер	\N	\N	f	0
134	Даниил Румянцев и Катерина Видяскина	дизайнер	\N	\N	f	0
158	Анастасия Гоголева	корректор	\N	\N	f	0
169	Мария Давидович	художники	\N	\N	f	0
95	Илья Черкасов	дизайнер	\N	\N	f	0
99	Кристина Близниченко	дизайнер	\N	\N	f	0
104	Кристина Максимова	дизайнер	\N	\N	f	0
108	Диана Гильманова. Дата релиза: 12.12.2024	продюсер	\N	\N	f	0
111	предисловия Катерина Гребенщикова	редактор	\N	\N	f	0
116	— Александр Киреев	художник	\N	\N	f	0
123	Дарья Ягрова	корректор	\N	\N	f	0
135	автор предисловия Илья Дик	продюсер	\N	\N	f	0
155	Николай Титов	корректор	\N	\N	f	0
160	Полина Шарафутдинова	редактор	\N	\N	f	0
165	Дмитрий Козлов	иллюстратор	\N	\N	f	0
174	текст буктрейлера читает Максим Сопатов	художник	\N	\N	f	0
98	Екатерина Ким	иллюстратор	\N	\N	f	0
107	Екатерина Апенько	дизайнер	\N	\N	f	0
110	автор предисловия Галина Дербина	корректор	\N	\N	f	0
115	Александр Лызь	веб-мастер	\N	\N	f	0
131	художник-иллюстратор Катерина Курносова	корректор	\N	\N	f	0
140	иллюстратор-дизайнер Илья Дик	корректор	\N	\N	f	0
163	Екатерина Курносова	иллюстратор	\N	\N	f	0
179	текст буктрейлера читает Александр Лозбенев	художник	\N	\N	f	0
100	Катерина Апенько	дизайнер	\N	\N	f	0
102	Катерина Гребенщикова и Анна Волкова	редактор	\N	\N	f	0
109	Любовь Мельникова	корректор	\N	\N	f	0
112	предисловия Александра Крученкова	корректор	\N	\N	f	0
113	Александр Киреев	художник	\N	\N	f	0
124	художник-иллюстратор Александр Киреев	корректор	\N	\N	f	0
132	автор предисловия Николай Старообрядцев	веб-мастер	\N	\N	f	0
136	фотограф Иван Зализко	продюсер	\N	\N	f	0
138	Наталья Коваленко	художник	\N	\N	f	0
161	Ольга Липская	иллюстратор	\N	\N	f	0
168	Кристина Габеева	художники	\N	\N	f	0
183	озвучка буктрейлера Ниёле Мейлуте	дизайнер	\N	\N	f	0
106	Александра Яшаркина	корректор	\N	\N	f	0
118	Диана Вершкова	продюсер	\N	\N	f	0
121	художник-иллюстратор Александр Петров	корректор	\N	\N	f	0
130	Сергей Дедович	продюсер	\N	\N	f	0
142	Кристина Габеева и Горыныч	иллюстратор	\N	\N	f	0
149	Катерина Курносова	иллюстратор	\N	\N	f	0
157	Мария Передок	редактор	\N	\N	f	0
170	видеограф Катя Буторина	веб-мастер	\N	\N	f	0
180	в основе коллажа на обложке фото Дарьи Дашковой	иллюстратор	\N	\N	f	0
\.


--
-- Data for Name: AudiobookWorkers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AudiobookWorkers" (id, audiobook_id, worker_id, sort_order) FROM stdin;
\.


--
-- Data for Name: AuthorContacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuthorContacts" (id, author_id, channel, url, sort_order) FROM stdin;
32	29	telegram	https://t.me/staroobryadtsev	0
33	29	instagram	https://instagram.com/nikolay.staroobryadtsev	1
34	29	email	mailto:nikolay@chtivo.spb.ru	2
35	1	telegram	https://t.me/lighthouse_keeper_1	0
36	1	email	mailto:nasibullin.i93@gmail.com	1
37	2	email	mailto:novokoleg79@yandex.ru	0
38	3	instagram	https://www.instagram.com/sketchesfrommoscow/	0
39	3	email	mailto:sketchesfrommoscow@gmail.com	1
40	5	email	mailto:favazmatova30@gmail.com	0
41	6	email	mailto:dinikin@gmail.com	0
42	8	instagram	https://www.instagram.com/borismainaev?igsh=MXQ5dGJmYWc4YzIyaA==	0
43	9	telegram	https://t.me/deadowitch	0
44	10	instagram	https://www.instagram.com/vladislav_olegowitch?igsh=MWQ0bmF1YWg0M2R5Nw%3D%3D&utm_source=qr	0
45	10	email	mailto:nes1999vlad@yandex.ru	1
46	13	facebook	https://www.facebook.com/profile.php?id=100041174074023	0
47	14	telegram	https://t.me/razmik_kochar	0
48	14	instagram	https://www.instagram.com/razmik.kochar	1
49	16	email	mailto:marina5tv@mail.ru	0
50	18	email	mailto:inner.inbox@gmail.com	0
51	18	facebook	https://www.facebook.com/rocknword	1
52	18	instagram	https://www.instagram.com/rocknword/	2
53	19	facebook	https://www.facebook.com/dasha.streltsova.3	0
54	19	instagram	https://www.instagram.com/deriendutout/	1
55	20	email	artem.severskiy.77@mail.ru	0
56	24	telegram	https://t.me/pankratov_live	0
57	24	email	mailto:pankratov_g@bk.ru	1
58	25	email	mailto:zhemoitelite@mail.ru	0
59	26	email	mailto:sashacarin@gmail.com	0
60	32	telegram	https://t.me/jankus_txt	0
61	32	email	mailto:oraoliveyra@gmail.com	1
62	35	facebook	https://www.facebook.com/erich.vonneff	0
63	36	email	mailto:alecsandr0709@mail.ru	0
64	39	email	mailto:a.aedov@mail.ru	0
65	1	vk	https://vk.com/nasibulline	2
66	6	vk	https://vk.com/id167965294	1
67	13	vk	https://vk.com/oganesmartirosyan	1
68	15	vk	https://vk.com/id175146355	0
69	18	vk	https://vk.com/rocknword	3
70	20	vk	https://vk.com/seversky_artem	1
71	2	vk	https://vk.com/id569882966	1
72	24	vk	https://vk.com/pankratov_live	2
73	25	vk	https://vk.com/id125923715	1
74	26	vk	https://vk.com/sashakarin	1
75	30	vk	https://vk.com/schetnikov_translations	0
76	32	vk	https://vk.com/jahnkus	2
77	34	vk	https://vk.com/eversum	0
78	37	vk	https://vk.com/id45567246	0
\.


--
-- Data for Name: Awards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Awards" (id, slug, title, image, "position", is_active) FROM stdin;
1	book-of-year-2019	Книга года 2019	/awards/book-of-year-2019.svg	1	t
2	editor-choice	Выбор редакции Чтива	/awards/editor-choice.svg	2	t
3	reader-choice	Голос читателей	/awards/reader-choice.svg	3	t
4	debut-shortlist	Дебютный список	/awards/debut-shortlist.svg	4	t
5	best-prose	Лучшая проза	/awards/best-prose.svg	5	t
6	formal-experiment	Формальный эксперимент	/awards/formal-experiment.svg	6	t
7	literary-game	Литературная игра	/awards/literary-game.svg	7	t
\.


--
-- Data for Name: BookContexts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BookContexts" (id, title_id, heading, body, url, sort_order) FROM stdin;
\.


--
-- Data for Name: Booktrailers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Booktrailers" (id, title_id, has_poster) FROM stdin;
1	58	t
\.


--
-- Data for Name: BoxSets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BoxSets" (id, slug, name, description, price, discount, image, "position", is_active, is_published, publish_date) FROM stdin;
1	usa-literature	Соединённые Штаты Литературы	Произведения американских авторов	1100	\N	usa-literature.svg	1	t	t	2026-01-01
2	inner	Весь Иннер	Все изданные в Чтиве произведения Сергея Иннера (и одно о нём)	1100	\N	inner.svg	2	t	t	2026-01-01
3	staroobryad	Весь Старообрядцев	Все изданные в Чтиве произведения Николая Старообрядцева	1100	\N	staroobryad.svg	3	t	t	2026-01-01
4	von-neff	Весь фон Нефф	Все изданные в Чтиве произведения Эриха фон Неффа	1100	\N	von-neff.svg	4	t	t	2026-01-01
5	womens-power	Женская сила	Книги прекрасной части коллектива авторов Чтива	1100	\N	womens-power.svg	5	t	t	2026-01-01
6	pankratov	Весь Панкратов	Все изданные в Чтиве произведения Георгия Панкратова	1100	\N	pankratov.svg	6	t	t	2026-01-01
7	novokshchenov	Весь Новокщёнов и сотоварищи	Все изданные в Чтиве произведения Олега Новокщёнова, Александра Киреева и Дмитрия Горшечникова	1100	\N	novokshchenov.svg	7	t	t	2026-01-01
8	russian-death	Российская смерть	Знакомая действительность и тёмные миры близ необъятной	1100	\N	russian-death.svg	8	t	t	2026-01-01
9	far-from-moscow	Далеко от Москвы	Произведения авторов из разных городов России	1100	\N	far-from-moscow.svg	9	t	t	2026-01-01
\.


--
-- Data for Name: BoxSetBooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BoxSetBooks" (id, box_set_id, title_id, "position", product_id) FROM stdin;
43	4	52	0	\N
44	4	60	1	\N
45	2	45	0	\N
46	2	50	1	\N
47	2	21	2	\N
48	3	58	0	\N
49	3	41	1	\N
50	6	56	0	\N
51	6	31	1	\N
52	7	29	0	\N
53	7	2	1	\N
56	7	37	4	\N
59	1	42	1	\N
60	1	46	2	\N
61	1	52	3	\N
62	1	57	4	\N
63	1	60	5	\N
64	1	62	6	\N
65	5	3	1	\N
66	5	18	2	\N
67	5	22	3	\N
68	5	32	4	\N
69	5	43	5	\N
70	8	7	1	\N
71	8	14	2	\N
72	8	27	3	\N
73	8	37	4	\N
74	8	41	5	\N
75	8	44	6	\N
76	8	47	7	\N
77	8	54	8	\N
78	8	59	9	\N
79	9	15	1	\N
80	9	23	2	\N
81	9	29	3	\N
82	9	53	4	\N
83	9	55	5	\N
84	9	64	6	\N
\.


--
-- Data for Name: CardBooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CardBooks" (id, title_id, price, sold_out, is_published, publish_date, release_date, discount, sold, demo, extra, counter_color, demo_path, format, printing_technique, paper, packaging, file_path) FROM stdin;
1	1	400.00	f	f	2026-01-01	2026-03-11	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	2	300.00	f	f	2018-01-01	2025-11-12	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	3	400.00	f	f	2024-01-01	2026-02-18	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	4	400.00	f	f	2026-01-01	2026-04-30	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	5	200.00	f	f	2022-01-01	2022-11-15	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
6	6	400.00	f	f	2023-01-01	2023-12-12	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	7	300.00	f	f	2024-01-01	2024-05-13	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
8	8	200.00	f	f	2025-01-01	2025-01-01	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
9	9	450.00	f	f	2024-01-01	2024-10-24	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
10	10	600.00	f	t	2026-01-01	2025-10-15	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
11	11	300.00	f	t	2026-01-01	2026-01-01	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	12	400.00	f	t	2025-01-01	2025-12-30	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	14	300.00	f	t	2025-01-01	2025-10-02	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
15	15	300.00	f	t	2019-01-01	2025-08-01	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
16	16	400.00	f	t	2025-01-01	2025-10-23	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
17	17	200.00	f	t	2025-01-01	2025-05-07	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
18	18	200.00	f	t	2025-01-01	2025-04-03	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
19	19	400.00	f	t	2023-01-01	2025-03-18	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
20	20	200.00	f	t	2024-01-01	2024-12-25	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
21	21	300.00	f	t	2017-01-01	2017-10-26	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
22	22	100.00	f	t	2018-01-01	2024-12-12	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
23	23	300.00	f	t	2024-01-01	2024-12-04	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
24	24	900.00	f	t	2023-01-01	2023-02-02	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
25	25	400.00	f	t	2024-01-01	2024-11-25	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
26	26	400.00	f	t	2024-01-01	2024-11-25	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
27	27	400.00	f	t	2024-01-01	2024-11-25	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
28	28	\N	f	t	2024-01-01	2024-11-06	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
29	29	300.00	f	t	2019-01-01	2019-12-10	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
30	30	150.00	f	t	2024-01-01	2024-10-03	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
31	31	300.00	f	t	2019-01-01	2024-08-16	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
32	32	100.00	f	t	2024-01-01	2024-04-04	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
33	33	3000.00	f	t	2023-01-01	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
34	34	\N	f	t	2023-01-01	2023-12-23	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
35	35	\N	f	t	2023-01-01	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
36	36	300.00	f	t	2023-01-01	2023-10-05	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
37	37	400.00	f	t	2023-01-01	2023-10-10	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
38	38	800.00	f	t	2023-01-01	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
39	39	200.00	f	t	2023-01-01	2023-08-31	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
40	40	300.00	f	t	2023-01-01	2023-08-18	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
41	41	400.00	f	t	2023-01-01	2023-07-25	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
42	42	400.00	f	t	2023-01-01	2023-01-04	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
43	43	100.00	f	t	2021-01-01	2021-01-25	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
44	44	400.00	f	t	2023-01-01	2023-03-02	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
45	45	300.00	f	t	2019-01-01	2023-01-19	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
46	46	\N	f	t	2023-01-01	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
47	47	200.00	f	t	2022-01-01	2022-09-27	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
48	48	200.00	f	t	2022-01-01	2022-09-15	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
49	49	300.00	f	t	2022-01-01	2022-06-13	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
50	50	300.00	f	t	2022-01-01	2022-05-08	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
51	51	300.00	f	t	2022-01-01	2022-05-04	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
52	52	300.00	f	t	2019-01-01	2019-06-10	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
53	53	300.00	f	t	2022-01-01	2022-03-02	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
54	54	300.00	f	t	2022-01-01	2022-01-31	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
55	55	300.00	f	t	2021-01-01	2021-10-26	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
56	56	300.00	f	t	2021-01-01	2021-04-22	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
57	57	300.00	f	t	2021-01-01	2021-10-21	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
59	59	300.00	f	t	2021-01-01	2021-02-28	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
60	60	200.00	f	t	2020-01-01	2020-12-14	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
61	61	100.00	f	t	2020-01-01	2020-08-17	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
62	62	300.00	f	t	2020-01-01	2020-07-22	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
63	63	100.00	f	t	2020-01-01	2020-05-08	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
64	64	300.00	f	t	2019-01-01	2020-04-13	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
58	58	300.00	f	t	2019-01-01	2019-04-04	\N	0	\N	\N	\N	\N	50x70 мм	Двухсторонняя шелкография белым.	Дизайнерская бумага Sirio Black Black 0,7 мм.	Индивидуальная упаковка с цветной запечаткой.	\N
13	13	300.00	f	t	2021-01-01	2025-10-22	\N	0	\N	\N	\N	murlo/demo.epub	\N	\N	\N	\N	\N
\.


--
-- Data for Name: CardBookWorkers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CardBookWorkers" (id, card_book_id, worker_id, sort_order) FROM stdin;
1	58	10	2
2	58	11	1
3	58	12	0
4	58	13	3
5	58	14	4
6	13	71	0
7	13	72	1
8	13	13	2
9	13	73	3
10	13	75	4
11	13	77	5
12	31	81	0
13	31	84	1
14	31	13	2
15	31	119	3
16	31	10	4
17	45	81	0
18	45	8	1
19	45	105	2
20	45	10	3
21	52	156	0
22	52	27	1
23	52	8	2
24	52	105	3
25	52	10	4
26	62	133	0
27	62	27	1
28	62	8	2
29	62	119	3
30	62	10	4
31	64	27	0
32	64	8	1
33	64	115	2
34	64	10	3
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: PromoCodes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PromoCodes" (id, code, kind, target_title_id, target_product_id, discount_pct, starts_at, ends_at, created_at) FROM stdin;
7b5db5ca-9833-4197-9339-7f62401f7ccf	SUMMER25	cart	\N	\N	20	2026-06-07 14:46:46.223431+00	2027-06-08 14:46:46.223431+00	2026-06-08 14:46:46.223431+00
8f4d30c2-67b4-4663-9e30-c0fd93e0d799	FREECART	cart	\N	\N	100	2026-06-07 14:46:46.223431+00	2026-07-08 14:46:46.223431+00	2026-06-08 14:46:46.223431+00
853afaf3-cb96-43c3-b896-0323496f281a	WHITE30	item	58	\N	30	2026-06-07 14:46:46.223431+00	2027-06-08 14:46:46.223431+00	2026-06-08 14:46:46.223431+00
37e64779-521f-414e-9339-8f4cd50f9bf3	AUDIO50	item	\N	AudioBook-4	50	2026-06-07 14:46:46.223431+00	2027-06-08 14:46:46.223431+00	2026-06-08 14:46:46.223431+00
1fcc820d-ce02-49a2-bc68-a9c012f790f6	OLDCODE	cart	\N	\N	50	2026-04-09 14:46:46.223431+00	2026-06-07 14:46:46.223431+00	2026-06-08 14:46:46.223431+00
\.


--
-- Data for Name: CartPromo; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Ebooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Ebooks" (id, title_id, price, is_published, publish_date, release_date, formats, character_count, file_path, demo_path, discount, sold) FROM stdin;
12	13	300.00	t	2021-01-01	2025-10-22	\N	\N	\N	\N	\N	f
9	9	450.00	f	2024-01-01	2024-10-24	\N	700000	\N	gomoza/demo.epub	\N	f
4	4	400.00	f	2026-01-01	2026-04-30	{FB2,EPUB}	254526	\N	troe-v-lodke-ne-schitaya-harona/demo.epub	\N	f
10	11	300.00	t	2026-01-01	2026-01-01	{FB2,EPUB}	700000	\N	segamegadrive/demo.epub	\N	f
5	5	200.00	f	2022-01-01	2022-11-15	{FB2,EPUB}	200000	\N	\N	\N	f
6	6	400.00	f	2023-01-01	2023-12-12	{FB2,EPUB,"БЫСТРЫЙ ПРОСМОТР ДЕМО"}	200000	\N	\N	\N	f
7	7	300.00	f	2024-01-01	2024-05-13	{FB2,EPUB}	265885	\N	\N	\N	f
8	8	200.00	f	2025-01-01	2025-01-01	{FB2,EPUB}	613000	\N	\N	\N	f
23	25	400.00	t	2024-01-01	2024-11-25	\N	552000	\N	gorod-sluchajnostej/demo.epub	\N	f
24	26	400.00	t	2024-01-01	2024-11-25	\N	341000	\N	vihr-zhizni/demo.epub	\N	f
25	27	400.00	t	2024-01-01	2024-11-25	\N	270000	\N	prizrachnye-istorii/demo.epub	\N	f
11	12	400.00	t	2025-01-01	2025-12-30	{FB2,EPUB}	340000	\N	\N	\N	f
13	14	300.00	t	2025-01-01	2025-10-02	{FB2,EPUB}	295200	\N	\N	\N	f
26	29	300.00	t	2019-01-01	2019-12-10	\N	220000	\N	amystis/demo.epub	\N	f
27	30	150.00	t	2024-01-01	2024-10-03	\N	700000	\N	pupsiki/demo.epub	\N	f
16	17	200.00	t	2025-01-01	2025-05-07	{FB2,EPUB}	525000	\N	\N	\N	f
17	18	200.00	t	2025-01-01	2025-04-03	{FB2,EPUB}	230000	\N	\N	\N	f
18	19	400.00	t	2023-01-01	2025-03-18	{FB2,EPUB}	250000	\N	\N	\N	f
19	20	200.00	t	2024-01-01	2024-12-25	{FB2,EPUB}	169000	\N	\N	\N	f
28	31	300.00	t	2019-01-01	2024-08-16	\N	260000	\N	rossijskoe-vremja/demo.epub	\N	f
31	37	400.00	t	2023-01-01	2023-10-10	{FB2,EPUB,"БЫСТРЫЙ ПРОСМОТР ДЕМО В PDF"}	230000	\N	predsetatel-tomskiy/demo.epub	\N	f
38	45	300.00	t	2019-01-01	2023-01-19	{"PDF FB2 EPUB HTML","БЫСТРЫЙ ПРОСМОТР ДЕМО В PDF"}	480000	\N	overdrive/demo.epub	\N	f
41	49	300.00	t	2022-01-01	2022-06-13	{FB2,EPUB}	321050	\N	dostoevski-dvoinik/demo.epub	\N	f
42	50	300.00	t	2022-01-01	2022-05-08	{FB2,EPUB}	410000	\N	pozhninoch/demo.epub	\N	f
43	51	300.00	t	2022-01-01	2022-05-04	{FB2,EPUB}	360000	\N	dostoevskie_dni/demo.epub	\N	f
44	52	300.00	t	2019-01-01	2019-06-10	\N	135000	\N	prostitutes/demo.epub	\N	f
45	53	300.00	t	2022-01-01	2022-03-02	{FB2,EPUB}	230000	\N	sepiya/demo.epub	\N	f
46	54	300.00	t	2022-01-01	2022-01-31	{FB2,EPUB}	230000	\N	prizraki/demo.epub	\N	f
29	32	100.00	t	2024-01-01	2024-04-04	{FB2,EPUB}	80000	\N	\N	\N	f
30	36	300.00	t	2023-01-01	2023-10-05	{FB2,EPUB}	142000	\N	\N	\N	f
47	55	300.00	t	2021-01-01	2021-10-26	\N	\N	\N	irokez/demo.epub	\N	f
32	39	200.00	t	2023-01-01	2023-08-31	{PDF,"БЫСТРЫЙ ПРОСМОТР ДЕМО"}	141204	\N	\N	\N	f
33	40	300.00	t	2023-01-01	2023-08-18	{FB2,EPUB}	200000	\N	\N	\N	f
34	41	400.00	t	2023-01-01	2023-07-25	{FB2,EPUB}	465000	\N	\N	\N	f
35	42	400.00	t	2023-01-01	2023-01-04	{FB2,EPUB,"БЫСТРЫЙ ПРОСМОТР ДЕМО В PDF"}	370000	\N	\N	\N	f
36	43	100.00	t	2021-01-01	2021-01-25	{FB2,EPUB}	70000	\N	\N	\N	f
37	44	400.00	t	2023-01-01	2023-03-02	{FB2,EPUB}	390000	\N	\N	\N	f
49	57	300.00	t	2021-01-01	2021-10-21	\N	180000	\N	podzemnie/demo.epub	\N	f
39	47	200.00	t	2022-01-01	2022-09-27	{FB2,EPUB}	220660	\N	\N	\N	f
40	48	200.00	t	2022-01-01	2022-09-15	{FB2,EPUB}	205000	\N	\N	\N	f
50	58	300.00	t	2019-01-01	2019-04-04	{PDF,FB2,HTML,Epub}	355000	\N	white-flower/demo.epub	\N	f
53	61	100.00	t	2020-01-01	2020-08-17	\N	90000	\N	lucifer/demo.epub	\N	f
54	62	300.00	t	2020-01-01	2020-07-22	\N	560000	\N	v-doroge/demo.epub	\N	f
56	64	300.00	t	2019-01-01	2020-04-13	\N	255000	\N	my-komu-to-nujni/demo.epub	\N	f
48	56	300.00	t	2021-01-01	2021-04-22	{FB2,EPUB}	530000	\N	\N	\N	f
51	59	300.00	t	2021-01-01	2021-02-28	{FB2,EPUB}	330000	\N	\N	\N	f
52	60	200.00	t	2020-01-01	2020-12-14	{FB2,EPUB}	170000	\N	\N	\N	f
55	63	100.00	t	2020-01-01	2020-05-08	\N	40000	\N	\N	\N	f
1	1	400.00	f	2026-01-01	2026-03-11	\N	700000	\N	igra-v-mayaki/demo.epub	\N	f
2	2	300.00	f	2018-01-01	2025-11-12	\N	320000	\N	baron/demo.epub	\N	f
3	3	400.00	f	2024-01-01	2026-02-18	\N	286000	\N	na-zemle-zaratushtry/demo.epub	\N	f
14	15	300.00	t	2019-01-01	2025-08-01	\N	340000	\N	kubok-voiny-i-tanca/demo.epub	\N	f
15	16	400.00	t	2025-01-01	2025-10-23	\N	700000	\N	whiskey-sour/demo.epub	\N	f
20	21	300.00	t	2017-01-01	2017-10-26	\N	400000	\N	poseiden/demo.epub	\N	f
21	22	100.00	t	2018-01-01	2024-12-12	\N	65000	\N	unhappened/demo.epub	\N	f
22	23	300.00	t	2024-01-01	2024-12-04	\N	195000	\N	vremyapadenie/demo.epub	\N	f
\.


--
-- Data for Name: EbookWorkers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EbookWorkers" (id, ebook_id, worker_id, sort_order) FROM stdin;
1	1	17	0
2	1	18	1
3	1	19	2
4	1	20	3
5	1	21	4
6	1	22	5
7	1	23	6
8	1	24	7
9	1	25	8
10	1	26	9
11	3	35	0
12	3	36	1
13	3	37	2
14	3	23	3
15	3	21	4
16	3	34	5
17	5	38	0
18	5	39	1
19	5	40	2
20	5	41	3
21	5	42	4
22	6	29	0
23	6	41	1
24	6	43	2
25	6	44	3
26	7	18	0
27	7	31	1
28	7	45	2
29	7	29	3
30	7	41	4
31	7	43	5
32	7	46	6
33	8	47	0
34	8	29	1
35	8	43	2
36	8	23	3
37	8	21	4
38	8	34	5
39	9	38	0
40	9	31	1
41	9	33	2
42	9	21	3
43	9	23	4
44	9	48	5
45	9	34	6
46	4	49	0
47	4	50	1
48	4	51	2
49	4	52	3
50	4	21	4
51	4	24	5
52	4	26	6
53	10	29	0
54	10	21	1
55	10	24	2
56	10	67	3
57	11	68	0
58	11	69	1
59	11	70	2
60	11	21	3
61	11	24	4
62	11	26	5
63	13	78	0
64	13	50	1
65	13	79	2
66	13	59	3
67	13	22	4
68	13	21	5
69	13	23	6
70	13	80	7
71	14	81	0
72	14	84	1
73	14	21	2
74	14	85	3
75	14	86	4
76	14	82	5
77	14	33	6
78	14	87	7
79	15	50	0
80	15	91	1
81	15	21	2
82	15	88	3
83	15	32	4
84	15	23	5
85	15	92	6
86	16	54	0
87	16	51	1
88	16	21	2
89	16	22	3
90	16	23	4
91	16	26	5
92	17	50	0
93	17	31	1
94	17	21	2
95	17	93	3
96	17	23	4
97	17	92	5
98	18	18	0
99	18	94	1
100	18	72	2
101	18	73	3
102	18	41	4
103	18	43	5
104	18	97	6
105	18	42	7
106	19	102	0
107	19	103	1
108	19	98	2
109	19	104	3
110	19	41	4
111	19	43	5
112	19	44	6
113	22	54	0
114	22	18	1
115	22	31	2
116	22	21	3
117	22	37	4
118	22	23	5
119	22	25	6
120	23	56	0
121	23	69	1
122	23	104	2
123	23	29	3
124	23	41	4
125	23	21	5
126	23	23	6
127	23	46	7
128	23	34	8
129	24	57	0
130	24	69	1
131	24	104	2
132	24	29	3
133	24	41	4
134	24	21	5
135	24	23	6
136	24	46	7
137	24	34	8
138	25	109	0
139	25	69	1
140	25	110	2
141	25	111	3
142	25	112	4
143	25	104	5
144	25	29	6
145	25	22	7
146	25	41	8
147	25	21	9
148	25	23	10
149	25	46	11
150	25	34	12
151	26	81	0
152	26	8	1
153	26	114	2
154	26	115	3
155	26	116	4
156	27	117	0
157	27	8	1
158	27	29	2
159	27	23	3
160	27	118	4
161	28	81	0
162	28	84	1
163	28	13	2
164	28	119	3
165	28	85	4
166	28	120	5
167	29	35	0
168	29	38	1
169	29	31	2
170	29	121	3
171	29	41	4
172	29	29	5
173	29	43	6
174	29	122	7
175	29	34	8
176	30	46	0
177	30	71	1
178	30	31	2
179	30	59	3
180	30	99	4
181	30	41	5
182	30	43	6
183	31	50	0
184	31	123	1
185	31	124	2
186	31	29	3
196	33	38	0
205	34	123	2
222	36	10	3
226	37	39	1
236	39	148	5
241	40	73	4
246	41	71	3
259	44	156	0
267	45	75	4
270	46	13	2
275	47	158	1
313	54	133	0
187	31	41	4
192	32	125	2
197	33	39	1
231	39	146	0
242	40	34	5
250	42	152	3
253	43	154	1
260	44	27	1
271	46	73	3
291	51	12	0
296	52	156	0
306	52	171	10
309	53	27	0
314	54	27	1
321	56	181	1
188	31	43	5
202	33	129	6
211	35	133	0
223	36	11	4
232	39	71	1
254	43	13	2
261	44	8	2
272	46	75	4
285	49	133	0
301	52	169	5
310	53	8	1
315	54	8	2
322	56	11	2
189	31	34	6
206	34	131	3
212	35	71	1
227	37	140	2
255	43	73	3
262	44	105	3
276	47	163	2
286	49	137	1
302	52	10	6
311	53	9	2
190	32	46	0
199	33	128	3
216	35	134	5
235	39	73	4
243	41	150	0
248	42	151	1
257	43	148	5
264	45	159	1
283	48	10	3
288	49	13	3
295	51	11	4
308	52	173	12
191	32	18	1
200	33	41	4
203	34	130	0
217	35	42	6
239	40	149	2
244	41	41	1
249	42	148	2
252	43	137	0
258	43	59	6
265	45	13	2
284	48	11	4
289	49	10	4
305	52	170	9
319	55	180	2
320	56	27	0
193	32	126	3
198	33	127	2
207	34	41	4
213	35	39	2
228	37	73	3
237	40	71	0
247	42	41	0
251	42	153	4
263	45	71	0
277	47	13	3
280	48	164	0
292	51	166	1
297	52	167	1
303	52	148	7
307	52	172	11
317	55	8	0
194	32	8	4
208	34	73	5
214	35	59	3
219	36	137	0
224	36	139	5
229	37	41	4
233	39	147	2
238	40	39	1
273	46	162	5
278	47	10	4
281	48	13	1
293	51	8	2
298	52	8	2
304	52	11	8
316	54	175	3
318	55	105	1
323	56	182	3
195	32	43	5
209	34	43	6
215	35	41	4
220	36	8	1
230	37	34	5
234	39	41	3
256	43	155	4
268	46	160	0
279	47	75	5
282	48	40	2
287	49	165	2
294	51	10	3
299	52	13	3
312	53	174	3
324	56	10	4
201	33	43	5
204	34	50	1
210	34	132	7
218	35	135	7
221	36	138	2
225	37	71	0
240	40	41	3
245	41	73	2
266	45	73	3
269	46	161	1
274	47	137	0
290	49	75	5
300	52	168	4
325	56	183	5
\.


--
-- Data for Name: GiftCardProducts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GiftCardProducts" (id, slug, name, face_value, sort_order, image_path) FROM stdin;
1	prelest	Прелесть	500	0	prelest.png
2	blagost	Благость	1000	1	blagost.png
3	transcendent	Трансцендент	5000	2	transcendent.png
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: GiftCards; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Likes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: OrderGiftCardApplications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: OrderItems; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Partners" (id, name, logo_path, website_url, sort_order) FROM stdin;
1	Ночлежка	\N	\N	0
2	Смена	\N	\N	1
3	Порядок Слов	\N	\N	2
4	Фаренгейт 451	\N	\N	3
5	Ахули	\N	\N	4
6	Дискурс	\N	\N	5
7	Подписные Издания	\N	\N	6
\.


--
-- Data for Name: PrintedBooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrintedBooks" (id, title_id, price, sold_out, is_published, publish_date, release_date, format, page_count, paper, cover_material, binding, illustrations, demo_path, discount, sold) FROM stdin;
1	2	1000.00	f	f	2018-01-01	2025-11-12	\N	\N	\N	\N	\N	\N	\N	\N	f
2	3	700.00	f	f	2024-01-01	2026-02-18	\N	\N	\N	\N	\N	\N	\N	\N	f
3	10	600.00	f	t	2026-01-01	2025-10-15	\N	\N	\N	\N	\N	\N	\N	\N	f
4	13	1000.00	f	t	2021-01-01	2025-10-22	\N	\N	\N	\N	\N	\N	\N	\N	f
5	15	600.00	f	t	2019-01-01	2025-08-01	\N	\N	\N	\N	\N	\N	\N	\N	f
6	16	1000.00	f	t	2025-01-01	2025-10-23	\N	\N	\N	\N	\N	\N	\N	\N	f
7	19	600.00	f	t	2023-01-01	2025-03-18	\N	\N	\N	\N	\N	\N	\N	\N	f
8	20	600.00	f	t	2024-01-01	2024-12-25	\N	\N	\N	\N	\N	\N	\N	\N	f
9	21	1000.00	f	t	2017-01-01	2017-10-26	\N	\N	\N	\N	\N	\N	\N	\N	f
10	22	600.00	f	t	2018-01-01	2024-12-12	\N	\N	\N	\N	\N	\N	\N	\N	f
11	24	900.00	f	t	2023-01-01	2023-02-02	\N	\N	\N	\N	\N	\N	\N	\N	f
12	29	1000.00	f	t	2019-01-01	2019-12-10	\N	\N	\N	\N	\N	\N	\N	\N	f
13	31	600.00	f	t	2019-01-01	2024-08-16	\N	\N	\N	\N	\N	\N	\N	\N	f
14	33	3000.00	f	t	2023-01-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
15	38	800.00	f	t	2023-01-01	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
16	42	900.00	f	t	2023-01-01	2023-01-04	\N	\N	\N	\N	\N	\N	\N	\N	f
17	45	1000.00	f	t	2019-01-01	2023-01-19	\N	\N	\N	\N	\N	\N	\N	\N	f
18	52	900.00	f	t	2019-01-01	2019-06-10	\N	\N	\N	\N	\N	\N	\N	\N	f
19	57	500.00	f	t	2021-01-01	2021-10-21	\N	\N	\N	\N	\N	\N	\N	\N	f
21	62	700.00	f	t	2020-01-01	2020-07-22	\N	\N	\N	\N	\N	\N	\N	\N	f
20	58	900.00	f	t	2019-01-01	2019-04-04	145x215 мм	200	офсетная 80 гр/кв. м.	мелованная, 250 гр./кв. м., матовое ламинирование, выборочный уф-лак	КШС (термоклей)	Чёрно-белые	\N	\N	f
\.


--
-- Data for Name: PrintedBookWorkers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrintedBookWorkers" (id, printed_book_id, worker_id, sort_order) FROM stdin;
1	1	7	0
2	1	27	1
3	1	28	2
4	1	29	3
5	1	8	4
6	1	21	5
7	1	30	6
8	2	31	0
9	2	32	1
10	2	29	2
11	2	33	3
12	2	21	4
13	2	34	5
14	3	38	0
15	3	53	1
16	3	35	2
17	3	17	3
18	3	54	4
19	3	18	5
20	3	31	6
21	3	55	7
22	3	56	8
23	3	57	9
24	3	19	10
25	3	58	11
26	3	36	12
27	3	51	13
28	3	40	14
29	3	59	15
30	3	60	16
31	3	61	17
32	3	62	18
33	3	63	19
34	3	64	20
35	3	65	21
36	3	21	22
37	3	23	23
38	3	66	24
39	4	71	0
40	4	72	1
41	4	13	2
42	4	21	3
43	4	73	4
44	4	74	5
45	4	75	6
46	4	76	7
47	5	81	0
48	5	51	1
49	5	82	2
50	5	33	3
51	5	8	4
52	5	21	5
53	5	83	6
54	6	50	0
55	6	31	1
56	6	21	2
57	6	88	3
58	6	89	4
59	6	23	5
60	6	90	6
61	7	18	0
62	7	94	1
63	7	51	2
64	7	72	3
65	7	95	4
66	7	29	5
67	7	21	6
68	7	96	7
69	8	50	0
70	8	38	1
71	8	55	2
72	8	51	3
73	8	98	4
74	8	99	5
75	8	100	6
76	8	22	7
77	8	21	8
78	8	101	9
79	9	105	0
80	9	106	1
81	9	51	2
82	9	21	3
83	9	107	4
84	9	29	5
85	9	34	6
86	10	7	0
87	10	51	1
88	10	105	2
89	10	8	3
90	10	21	4
91	10	108	5
92	12	81	0
93	12	50	1
94	12	51	2
95	12	33	3
96	12	113	4
97	12	65	5
98	12	43	6
99	12	23	7
100	12	34	8
101	16	133	0
102	16	71	1
103	16	39	2
104	16	59	3
105	16	8	4
106	16	134	5
107	16	42	6
108	16	135	7
109	16	136	8
110	17	81	0
111	17	19	1
112	17	8	2
113	17	141	3
114	17	142	4
115	17	143	5
116	17	144	6
117	17	145	7
118	18	156	0
119	18	137	1
120	18	157	2
121	18	27	3
122	18	158	4
123	18	9	5
124	18	10	6
125	18	141	7
126	18	8	8
127	19	133	0
128	19	137	1
129	19	165	2
130	19	8	3
131	19	10	4
132	19	158	5
133	19	75	6
134	20	7	0
135	20	8	1
136	20	9	2
137	20	10	3
138	20	11	4
139	21	133	0
140	21	27	1
141	21	8	2
142	21	119	3
143	21	176	4
144	21	177	5
145	21	178	6
146	21	179	7
\.


--
-- Data for Name: Profiles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subscriptions" (id, slug, name, perks, price, image, "position", is_active, description, discount, is_published, publish_date, image_blur) FROM stdin;
1	blizkost	ЧУДО БЛИЗОСТИ	{"Цифровые издания в день релиза","Аудиоиздания в день релиза"}	300	sub_blizkost.png	1	t	Базовый ежемесячный доступ к новым цифровым и аудиоизданиям Чтива.	\N	t	2026-01-01	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMG/8QAHBAAAgMAAwEAAAAAAAAAAAAAAQMAAhESIVFi/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAATH/2gAMAwEAAhEDEQA/AMxVqChwCcNs4/PslZqjYkJAG9DYiCrkf//Z
2	prichastie	ЧУДО ПРИЧАСТИЯ	{"Цифровые издания в день релиза","Аудиоиздания в день релиза","Классика Чтива раз в месяц"}	500	sub_prichastie.png	2	t	Расширенная подписка с новинками и ежемесячной классикой Чтива.	\N	t	2026-01-01	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMG/8QAIBAAAQQCAQUAAAAAAAAAAAAAAQACAxIEEQUhIjFikf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAEx/9oADAMBAAIRAxEAPwDMmeAtnrAAHHs9VdmVx9G3xDbXXQHn6iIVcj//2Q==
3	edinstvo	ЧУДО ЕДИНСТВА	{"Цифровые издания в день релиза","Аудиоиздания в день релиза","Классика Чтива раз в месяц","Печатные издания в день релиза"}	1000	sub_edinstvo.png	3	t	Полная подписка с цифровыми, аудио и печатными изданиями в день релиза.	\N	t	2026-01-01	data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQG/8QAHxAAAgECBwAAAAAAAAAAAAAAAQIAAxETISJBUZHh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAATH/2gAMAwEAAhEDEQA/AMqlSnhHRsO/ZO5BdiosCchxEQVcj//Z
\.


--
-- Data for Name: TitleSimilarTitles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TitleSimilarTitles" (id, title_id, similar_title_id, "position") FROM stdin;
1	1	8	0
2	1	23	1
3	1	29	2
4	1	19	3
5	2	58	0
6	2	22	1
7	2	21	2
8	3	40	0
9	3	6	1
10	3	19	2
11	5	47	0
12	5	48	1
13	5	49	2
14	6	39	0
15	6	40	1
16	6	19	2
17	7	20	0
18	7	52	1
19	7	60	2
20	8	63	0
21	8	5	1
22	8	47	2
23	9	13	0
24	9	54	1
25	4	27	0
26	4	22	1
27	4	19	2
28	10	17	0
29	10	18	1
30	11	30	0
31	11	16	1
32	11	8	2
33	11	63	3
34	12	16	0
35	12	26	1
36	12	17	2
37	12	18	3
38	13	37	0
39	13	55	1
40	14	7	0
41	14	18	1
42	14	52	2
43	15	52	0
44	15	45	1
45	15	58	2
46	16	17	0
47	16	23	1
48	16	18	2
49	17	18	0
50	17	8	1
51	17	19	2
52	18	20	0
53	18	3	1
54	18	23	2
55	19	42	0
56	19	44	1
57	19	24	2
58	20	13	0
59	20	45	1
60	20	53	2
61	21	58	0
62	21	22	1
63	21	2	2
64	22	58	0
65	22	2	1
66	22	21	2
67	23	64	0
68	23	54	1
69	23	9	2
70	24	10	0
71	24	45	1
72	24	42	2
73	25	49	0
74	25	61	1
75	25	7	2
76	26	7	0
77	26	41	1
78	26	44	2
79	27	37	0
80	27	39	1
81	27	47	2
82	28	24	0
83	28	45	1
84	28	42	2
85	29	15	0
86	29	2	1
87	29	52	2
88	30	63	0
89	30	8	1
90	30	53	2
91	31	29	0
92	31	15	1
93	31	2	2
94	32	56	0
95	32	64	1
96	33	46	0
97	33	39	1
98	33	40	2
99	34	44	0
100	34	36	1
101	34	37	2
102	36	41	0
103	36	19	1
104	36	42	2
105	37	39	0
106	37	40	1
107	37	41	2
108	39	19	0
109	39	42	1
110	39	44	2
111	40	41	0
112	40	19	1
113	40	42	2
114	41	19	0
115	41	42	1
116	41	44	2
117	42	5	0
118	42	47	1
119	42	48	2
120	43	10	0
121	43	60	1
122	43	42	2
123	44	24	0
124	44	45	1
125	44	42	2
126	45	58	0
127	45	22	1
128	45	2	2
129	46	48	0
130	46	5	1
131	46	47	2
132	47	48	0
133	47	49	1
134	47	50	2
135	47	51	3
136	48	49	0
137	48	50	1
138	48	51	2
139	49	52	0
140	49	50	1
141	49	51	2
142	50	52	0
143	50	53	1
144	50	54	2
145	51	52	0
146	51	53	1
147	51	54	2
148	52	58	0
149	52	22	1
150	52	2	2
151	53	54	0
152	53	10	1
153	53	13	2
154	54	10	0
155	54	13	1
156	54	37	2
157	55	37	0
158	56	57	0
159	56	59	1
160	56	43	2
161	57	59	0
162	57	43	1
163	57	10	2
164	58	22	0
165	58	2	1
166	58	21	2
167	59	43	0
168	59	10	1
169	59	60	2
170	60	42	0
171	60	62	1
172	60	61	2
173	61	64	0
174	61	31	1
175	61	29	2
176	62	64	0
177	62	31	1
178	62	29	2
179	63	45	0
180	63	31	1
181	63	29	2
182	64	31	0
183	64	29	1
184	64	15	2
\.


--
-- Data for Name: Titles_Authors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Titles_Authors" (id, title_id, author_id) FROM stdin;
1	1	1
2	2	2
3	2	3
4	2	4
5	3	5
6	4	6
7	5	6
8	6	7
9	7	8
10	8	9
11	9	10
12	10	11
13	11	9
14	12	12
15	13	10
16	14	8
17	15	13
18	16	14
19	17	15
20	18	16
21	19	1
22	20	17
23	21	18
24	22	19
25	23	20
26	25	21
27	26	22
28	27	23
29	29	2
30	30	9
31	31	24
32	32	25
33	36	26
34	37	2
35	37	3
36	37	4
37	39	27
38	40	28
39	41	29
40	42	30
41	43	31
42	44	32
43	45	18
44	46	30
45	47	33
46	48	34
47	49	21
48	50	18
49	51	13
50	52	35
51	53	36
52	54	20
53	55	37
54	56	24
55	57	30
56	58	29
57	59	38
58	60	35
59	61	39
60	62	30
61	63	9
62	64	20
\.


--
-- Data for Name: Titles_Awards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Titles_Awards" (id, title_id, award_id, "position") FROM stdin;
1	1	7	1
2	3	2	2
3	4	3	3
4	5	4	4
5	6	5	5
6	6	2	2
7	7	6	6
8	8	3	3
9	9	2	2
10	10	4	4
11	11	7	1
12	12	5	5
13	12	3	3
14	12	2	2
15	14	6	6
16	15	4	4
17	15	2	2
18	15	1	1
19	16	3	3
20	18	5	5
21	18	2	2
22	20	4	4
23	20	3	3
24	21	6	6
25	21	2	2
26	24	5	5
27	24	3	3
28	24	2	2
29	25	4	4
30	27	2	2
31	28	6	6
32	28	3	3
33	29	1	1
34	30	5	5
35	30	4	4
36	30	2	2
37	31	1	1
38	32	3	3
39	33	2	2
40	35	6	6
41	35	4	4
42	36	5	5
43	36	3	3
44	36	2	2
45	39	2	2
46	40	4	4
47	40	3	3
48	42	6	6
49	42	5	5
50	42	2	2
51	44	3	3
52	45	4	4
53	45	2	2
54	45	1	1
55	48	5	5
56	48	3	3
57	48	2	2
58	49	6	6
59	50	4	4
60	51	2	2
61	52	3	3
62	52	1	1
63	54	5	5
64	54	2	2
65	55	4	4
66	56	6	6
67	56	3	3
68	57	2	2
69	58	1	1
70	60	5	5
71	60	4	4
72	60	3	3
73	60	2	2
74	63	6	6
75	63	2	2
76	64	3	3
77	64	1	1
\.


--
-- Data for Name: UserSubscriptions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: featured_books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.featured_books (id, title_id, sort_order, created_at) FROM stdin;
6	13	1	2026-06-06 16:42:50.640633+00
7	17	2	2026-06-06 16:42:50.640633+00
8	18	3	2026-06-06 16:42:50.640633+00
9	14	4	2026-06-06 16:42:50.640633+00
10	19	5	2026-06-06 16:42:50.640633+00
\.


--
-- Name: AdminAuditLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AdminAuditLog_id_seq"', 1, false);


--
-- Name: Articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Articles_id_seq"', 1, false);


--
-- Name: AudiobookWorkers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AudiobookWorkers_id_seq"', 1, false);


--
-- Name: Audiobooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Audiobooks_id_seq"', 1, false);


--
-- Name: AuthorContacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AuthorContacts_id_seq"', 78, true);


--
-- Name: Authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Authors_id_seq"', 1, false);


--
-- Name: Awards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Awards_id_seq"', 7, true);


--
-- Name: BookContexts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."BookContexts_id_seq"', 1, false);


--
-- Name: Booktrailers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Booktrailers_id_seq"', 1, true);


--
-- Name: BoxSetBooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."BoxSetBooks_id_seq"', 84, true);


--
-- Name: BoxSets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."BoxSets_id_seq"', 9, true);


--
-- Name: CardBookWorkers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CardBookWorkers_id_seq"', 34, true);


--
-- Name: CardBooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CardBooks_id_seq"', 1, false);


--
-- Name: EbookWorkers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EbookWorkers_id_seq"', 325, true);


--
-- Name: Ebooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Ebooks_id_seq"', 1, false);


--
-- Name: GiftCardProducts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GiftCardProducts_id_seq"', 3, true);


--
-- Name: OrderGiftCardApplications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrderGiftCardApplications_id_seq"', 1, false);


--
-- Name: OrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrderItems_id_seq"', 3, true);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 4, true);


--
-- Name: Partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Partners_id_seq"', 7, true);


--
-- Name: PrintedBookWorkers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PrintedBookWorkers_id_seq"', 146, true);


--
-- Name: PrintedBooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PrintedBooks_id_seq"', 1, false);


--
-- Name: Subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Subscriptions_id_seq"', 3, true);


--
-- Name: TitleSimilarTitles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TitleSimilarTitles_id_seq"', 184, true);


--
-- Name: Titles_Authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Titles_Authors_id_seq"', 62, true);


--
-- Name: Titles_Awards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Titles_Awards_id_seq"', 77, true);


--
-- Name: Titles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Titles_id_seq"', 1, false);


--
-- Name: UserSubscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserSubscriptions_id_seq"', 1, false);


--
-- Name: Workers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Workers_id_seq"', 183, true);


--
-- Name: featured_books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.featured_books_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 9cAVFG37jR7cM21pSu66e8j6a30fefxEYvwSI0Uc3J1XuP5IxvAmXhwEpaArGAR

